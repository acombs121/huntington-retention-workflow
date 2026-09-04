"""
=====================================================================
FastAPI IAP JWT Verification Middleware (iap_jwt_middleware.py)
Verifies X-Goog-IAP-JWT-Assertion header in Google Cloud Run production,
while allowing local mock authentication when APP_ENV=local.
Includes thread-safe in-memory key caching to prevent event-loop blocking.
=====================================================================
"""
import os
import time
import logging
import threading
from typing import Optional, Dict, Any, Tuple
from fastapi import Request, HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token

logger = logging.getLogger("iap_middleware")

# Expected IAP Issuer for Google Cloud
IAP_ISSUER = "https://cloud.google.com/iap"
IAP_CERTS_URL = "https://www.gstatic.com/iap/verify/public_key"


class CachedIapTransportRequest(requests.Request):
    """
    Thread-safe transport Request that caches GET responses (such as IAP JWKS keys)
    for a configurable TTL, eliminating blocking network round-trips on every request.
    """
    def __init__(self, ttl_seconds: int = 3600, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self._ttl = ttl_seconds
        self.last_invalidation = 0.0

    def __call__(self, url: str, method: str = "GET", body=None, headers=None, timeout=10, **kwargs):
        if method == "GET" and not body:
            with self._lock:
                now = time.time()
                if url in self._cache:
                    cached_time, cached_resp = self._cache[url]
                    if now - cached_time < self._ttl:
                        return cached_resp

                resp = super().__call__(url, method=method, body=body, headers=headers, timeout=timeout, **kwargs)
                self._cache[url] = (now, resp)
                return resp

        return super().__call__(url, method=method, body=body, headers=headers, timeout=timeout, **kwargs)

    def invalidate_with_cooldown(self, url: Optional[str] = None, min_interval: float = 60.0) -> bool:
        """Atomically invalidate the cache if min_interval seconds have elapsed since last invalidation."""
        with self._lock:
            now = time.time()
            if now - self.last_invalidation > min_interval:
                if url:
                    self._cache.pop(url, None)
                else:
                    self._cache.clear()
                self.last_invalidation = now
                return True
            return False

    def invalidate(self, url: Optional[str] = None):
        """Invalidate the cache for a specific URL or all cached entries."""
        with self._lock:
            if url:
                self._cache.pop(url, None)
            else:
                self._cache.clear()
            self.last_invalidation = time.time()


# Global cached transport instance reused across requests
_cached_transport_request = CachedIapTransportRequest(ttl_seconds=3600)


def get_expected_iap_audience() -> Optional[str]:
    """
    Resolves the expected IAP audience string.
    For direct Cloud Run IAP integration:
      Format: /projects/{PROJECT_NUMBER}/locations/{GCP_REGION}/services/{APP_NAME}
    For External Application Load Balancers (GCLB):
      Format: /projects/{PROJECT_NUMBER}/global/backendServices/{BACKEND_SERVICE_ID}
    Can also be explicitly overridden by setting IAP_AUDIENCE.
    """
    explicit_aud = os.getenv("IAP_AUDIENCE")
    if explicit_aud:
        return explicit_aud

    project_number = os.getenv("PROJECT_NUMBER")
    region = os.getenv("GCP_REGION", "us-central1")
    app_name = os.getenv("APP_NAME")

    # Cloud Run Direct IAP Audience
    if project_number and app_name:
        return f"/projects/{project_number}/locations/{region}/services/{app_name}"

    # External HTTPS Load Balancer IAP Audience fallback
    backend_service_id = os.getenv("BACKEND_SERVICE_ID")
    if project_number and backend_service_id:
        return f"/projects/{project_number}/global/backendServices/{backend_service_id}"

    return None


def get_authenticated_user(request: Request) -> Dict[str, Any]:
    """
    Extracts and verifies the authenticated Google user from IAP JWT headers.
    When running locally (APP_ENV='local'), returns a mock developer identity unless
    IAP verification is explicitly forced with IAP_ENABLED_LOCAL=true.
    In production, strictly validates the cryptographic JWT against Google public keys
    and enforces allowed domains configured in IAP_ALLOWED_DOMAINS (defaults to 'google.com').
    """
    # Detect Cloud Run runtime environment (K_SERVICE is automatically injected by Cloud Run)
    is_cloud_run = bool(os.getenv("K_SERVICE"))
    if is_cloud_run:
        app_env = "production"
    else:
        app_env = os.getenv("APP_ENV", "production").lower()

    iap_enabled_local = os.getenv("IAP_ENABLED_LOCAL", "false").lower() == "true"

    # Strict local bypass check: ONLY outside Cloud Run AND when APP_ENV=local AND not forced
    if not is_cloud_run and app_env == "local" and not iap_enabled_local:
        return {
            "sub": "local-dev-user-001",
            "email": "developer@google.com",
            "hd": "google.com",
            "name": "Local Developer (Mock)",
        }

    # Production Cloud Run IAP JWT verification
    iap_jwt = request.headers.get("x-goog-iap-jwt-assertion")
    if not iap_jwt:
        logger.error("Missing X-Goog-IAP-JWT-Assertion header in request.")
        raise HTTPException(status_code=401, detail="Unauthorized: Missing IAP assertion header.")

    expected_audience = get_expected_iap_audience()
    if not expected_audience:
        logger.critical("Fatal: IAP audience could not be resolved in production environment. Failing closed.")
        raise HTTPException(status_code=500, detail="Authentication configuration error: missing IAP audience.")

    try:
        try:
            claims = id_token.verify_token(
                iap_jwt,
                _cached_transport_request,
                audience=expected_audience,
                certs_url=IAP_CERTS_URL,
            )
        except Exception as primary_err:
            err_msg = str(primary_err).lower()
            is_key_error = "key id" in err_msg or "certificate" in err_msg
            # Debounced retry: only retry on suspected key rotation with an atomic 60s cooldown
            if is_key_error and _cached_transport_request.invalidate_with_cooldown(IAP_CERTS_URL, min_interval=60.0):
                logger.warning(f"IAP token key lookup failed ({primary_err}). Invalidating cache and retrying...")
                claims = id_token.verify_token(
                    iap_jwt,
                    _cached_transport_request,
                    audience=expected_audience,
                    certs_url=IAP_CERTS_URL,
                )
            else:
                raise

        # Verify issuer
        if claims.get("iss") != IAP_ISSUER:
            logger.error(f"Invalid IAP issuer: {claims.get('iss')}")
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid IAP issuer.")

        # Enforce IAP Allowed Domains at application/JWT level (defaults to google.com)
        allowed_domains_env = os.getenv("IAP_ALLOWED_DOMAINS", "google.com")
        allowed_domains = [d.strip().lower() for d in allowed_domains_env.split(",") if d.strip()]

        user_email = (claims.get("email") or "").lower()
        user_hd = (claims.get("hd") or "").lower()
        email_domain = user_email.split("@")[-1] if "@" in user_email else ""

        if allowed_domains and "*" not in allowed_domains:
            if not (user_hd in allowed_domains or email_domain in allowed_domains):
                logger.warning(
                    f"Access denied: User '{user_email}' (hd: '{user_hd}') does not match allowed domains: {allowed_domains}"
                )
                raise HTTPException(status_code=403, detail="Forbidden: User domain not authorized.")

        return {
            "sub": claims.get("sub"),
            "email": claims.get("email"),
            "hd": claims.get("hd"),
            "name": claims.get("name"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify IAP JWT token: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid IAP JWT token.")
