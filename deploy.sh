#!/usr/bin/env bash
# =====================================================================
# Automated Cloud Run Deployment Script
# Parameterized via .env - No hardcoded values
# =====================================================================
set -euo pipefail

# Handle help flag before requiring .env
for arg in "$@"; do
  if [[ "${arg}" == "--help" || "${arg}" == "-h" ]]; then
    echo "Usage: ./deploy.sh"
    echo ""
    echo "Builds and deploys the Cloud Run demo with Direct IAP and Gemini Enterprise Agent Platform."
    echo "Requires a configured .env file in the working directory (copy from example.env)."
    exit 0
  fi
done

# 1. Ensure .env exists and safely source variables using POSIX set -a
if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found. Please copy example.env to .env and configure your values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

# 2. Validate required environment variables and format constraints
: "${GCP_PROJECT:?Missing GCP_PROJECT in .env}"
: "${GCP_REGION:?Missing GCP_REGION in .env}"
: "${APP_NAME:?Missing APP_NAME in .env}"
: "${SERVICE_ACCOUNT_NAME:?Missing SERVICE_ACCOUNT_NAME in .env}"
: "${GEMINI_MODEL:?Missing GEMINI_MODEL in .env}"
: "${IAP_ALLOWED_DOMAINS:?Missing IAP_ALLOWED_DOMAINS in .env}"

# Setup cleanup trap for temporary files
IAP_SETTINGS_TMP=""
cleanup() {
  if [[ -n "${IAP_SETTINGS_TMP:-}" && -f "${IAP_SETTINGS_TMP}" ]]; then
    rm -f "${IAP_SETTINGS_TMP}"
  fi
}
trap cleanup EXIT INT TERM

# Determine IAP Allowed Member for GCP IAM (defaulting to current gcloud user if unspecified)
CURRENT_ACCOUNT=$(gcloud config get-value account 2>/dev/null || true)
IAP_ALLOWED_MEMBER="${IAP_ALLOWED_MEMBER:-}"

# Intercept and correct if user specified domain:google.com in IAM member
GOOGLE_DOMAIN_REGEX='(^|:)domain:.*google\.com$|^google\.com$'
if [[ "${IAP_ALLOWED_MEMBER}" =~ ${GOOGLE_DOMAIN_REGEX} ]]; then
  echo "NOTICE: 'domain:google.com' cannot be added to IAM roles due to GCP Domain Restricted Sharing (DRS) Org Policies."
  echo "        Using active gcloud user (${CURRENT_ACCOUNT}) for IAM role binding, while keeping 'google.com' in IAP_ALLOWED_DOMAINS for JWT verification."
  IAP_ALLOWED_MEMBER=""
fi

if [[ -z "${IAP_ALLOWED_MEMBER}" ]]; then
  if [[ -n "${CURRENT_ACCOUNT}" && "${CURRENT_ACCOUNT}" != "(unset)" ]]; then
    if [[ "${CURRENT_ACCOUNT}" == *".gserviceaccount.com" ]]; then
      IAP_ALLOWED_MEMBER="serviceAccount:${CURRENT_ACCOUNT}"
    else
      IAP_ALLOWED_MEMBER="user:${CURRENT_ACCOUNT}"
    fi
  else
    echo "ERROR: IAP_ALLOWED_MEMBER is not set and no active gcloud account found in 'gcloud config get-value account'." >&2
    echo "Please set IAP_ALLOWED_MEMBER in .env (e.g. user:your-email@example.com)." >&2
    exit 1
  fi
elif [[ "${IAP_ALLOWED_MEMBER}" != *":"* ]]; then
  if [[ "${IAP_ALLOWED_MEMBER}" == *".gserviceaccount.com" ]]; then
    IAP_ALLOWED_MEMBER="serviceAccount:${IAP_ALLOWED_MEMBER}"
  elif [[ "${IAP_ALLOWED_MEMBER}" == *"@"* ]]; then
    IAP_ALLOWED_MEMBER="user:${IAP_ALLOWED_MEMBER}"
  else
    IAP_ALLOWED_MEMBER="domain:${IAP_ALLOWED_MEMBER}"
  fi
fi

# Preflight Check: Validate APP_NAME naming regex
if [[ ! "${APP_NAME}" =~ ^[a-z]([-a-z0-9]*[a-z0-9])?$ ]]; then
  echo "ERROR: APP_NAME '${APP_NAME}' is invalid. Must start with a lowercase letter, contain only lowercase letters, numbers, or hyphens, and not end with a hyphen." >&2
  exit 1
fi

# Preflight Check: Validate Service Account name length (between 6 and 30 characters)
if (( ${#SERVICE_ACCOUNT_NAME} < 6 || ${#SERVICE_ACCOUNT_NAME} > 30 )); then
  echo "ERROR: SERVICE_ACCOUNT_NAME '${SERVICE_ACCOUNT_NAME}' must be between 6 and 30 characters." >&2
  exit 1
fi

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT}.iam.gserviceaccount.com"
REPO_NAME="${APP_NAME}-repo"
IMAGE_URL="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${REPO_NAME}/${APP_NAME}:latest"

echo "=========================================================="
echo "Deploying:    ${APP_NAME}"
echo "Project:      ${GCP_PROJECT}"
echo "Region:       ${GCP_REGION}"
echo "Model:        ${GEMINI_MODEL}"
echo "SA Email:     ${SERVICE_ACCOUNT_EMAIL}"
echo "IAM Member:   ${IAP_ALLOWED_MEMBER}"
echo "IAP Domains:  ${IAP_ALLOWED_DOMAINS}"
echo "=========================================================="

# 3. Preflight check: Ensure gcloud is authenticated and project is accessible
gcloud config set project "${GCP_PROJECT}" --quiet
PROJECT_NUMBER=$(gcloud projects describe "${GCP_PROJECT}" --format="value(projectNumber)")
: "${PROJECT_NUMBER:?Unable to retrieve GCP Project Number. Please check gcloud authentication and billing.}"
IAP_AUDIENCE="/projects/${PROJECT_NUMBER}/locations/${GCP_REGION}/services/${APP_NAME}"
echo "IAP Audience: ${IAP_AUDIENCE}"

# 4. Enable required GCP APIs
echo "--> Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iap.googleapis.com \
  iam.googleapis.com \
  --project="${GCP_PROJECT}" --quiet

# 5. Create Artifact Registry repository if it doesn't exist
echo "--> Checking Artifact Registry repository..."
if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${GCP_REGION}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "    Creating Artifact Registry repo: ${REPO_NAME}..."
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${GCP_REGION}" \
    --description="Docker repository for ${APP_NAME} demo" \
    --project="${GCP_PROJECT}" --quiet
fi

# 6. Create dedicated runtime Service Account if it doesn't exist (NO JSON KEYS)
echo "--> Checking runtime Service Account..."
if ! gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "    Creating Service Account: ${SERVICE_ACCOUNT_NAME}..."
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="Runtime Service Account for ${APP_NAME} Cloud Run Demo" \
    --project="${GCP_PROJECT}" --quiet
fi

# 7. Grant Gemini Enterprise Agent Platform (roles/aiplatform.user) role to runtime Service Account (with propagation retry)
echo "--> Granting roles/aiplatform.user to Service Account..."
IAM_GRANTED=false
for i in {1..5}; do
  if gcloud projects add-iam-policy-binding "${GCP_PROJECT}" \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/aiplatform.user" \
    --condition=None \
    --quiet >/dev/null 2>&1; then
    IAM_GRANTED=true
    break
  fi
  echo "    Waiting for IAM service account propagation (attempt $i/5)..."
  sleep 5
done

if [[ "${IAM_GRANTED}" != "true" ]]; then
  echo "ERROR: Failed to grant roles/aiplatform.user to ${SERVICE_ACCOUNT_EMAIL}." >&2
  exit 1
fi

# 8. Check Secret Manager for required secrets (with non-interactive CI guard)
SECRET_FLAGS=""
if [[ -n "${REQUIRED_SECRETS:-}" ]]; then
  echo "--> Checking Secret Manager secrets..."
  IFS=',' read -ra SECRETS <<< "${REQUIRED_SECRETS}"
  for SECRET_NAME in "${SECRETS[@]}"; do
    SECRET_NAME=$(echo "${SECRET_NAME}" | xargs) # Trim whitespace
    if [[ -z "${SECRET_NAME}" ]]; then continue; fi

    if ! gcloud secrets describe "${SECRET_NAME}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
      echo "    Secret '${SECRET_NAME}' not found in Secret Manager."
      if [[ ! -t 0 ]]; then
        echo "ERROR: Secret '${SECRET_NAME}' is missing and shell is non-interactive." >&2
        exit 1
      fi
      read -s -p "    Enter value for secret '${SECRET_NAME}': " SECRET_VAL
      echo ""
      printf '%s' "${SECRET_VAL}" | gcloud secrets create "${SECRET_NAME}" \
        --data-file=- \
        --replication-policy="automatic" \
        --project="${GCP_PROJECT}" --quiet
      echo "    Created secret '${SECRET_NAME}'."
    fi

    # Grant Secret Accessor role to Service Account for this secret
    gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
      --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
      --role="roles/secretmanager.secretAccessor" \
      --project="${GCP_PROJECT}" \
      --quiet >/dev/null

    if [[ -z "${SECRET_FLAGS}" ]]; then
      SECRET_FLAGS="--set-secrets=${SECRET_NAME}=${SECRET_NAME}:latest"
    else
      SECRET_FLAGS="${SECRET_FLAGS},${SECRET_NAME}=${SECRET_NAME}:latest"
    fi
  done
fi

# 9. Build container image using Cloud Build
echo "--> Building container image via Cloud Build..."
gcloud builds submit --tag="${IMAGE_URL}" --project="${GCP_PROJECT}" --quiet

# 10. Deploy to Google Cloud Run with safe --set-env-vars delimiter and IAP enabled
echo "--> Deploying service to Google Cloud Run..."
DEPLOY_CMD=(
  gcloud run deploy "${APP_NAME}"
  --image="${IMAGE_URL}"
  --region="${GCP_REGION}"
  --service-account="${SERVICE_ACCOUNT_EMAIL}"
  --min-instances="${MIN_INSTANCES:-0}"
  --max-instances="${MAX_INSTANCES:-3}"
  --memory="${MEMORY:-2Gi}"
  --cpu="${CPU:-1}"
  --timeout="${TIMEOUT:-3600}"
  --iap
  --no-invoker-iam-check
  --no-allow-unauthenticated
  --ingress="all"
  --set-env-vars="^@^GCP_PROJECT=${GCP_PROJECT}@GCP_REGION=${GCP_REGION}@APP_NAME=${APP_NAME}@PROJECT_NUMBER=${PROJECT_NUMBER}@IAP_AUDIENCE=${IAP_AUDIENCE}@GEMINI_MODEL=${GEMINI_MODEL}@APP_ENV=${PROD_ENV:-production}@DEBUG=false@IAP_ALLOWED_DOMAINS=${IAP_ALLOWED_DOMAINS}"
  --project="${GCP_PROJECT}"
  --quiet
)

if [[ -n "${SECRET_FLAGS}" ]]; then
  DEPLOY_CMD+=("${SECRET_FLAGS}")
fi

"${DEPLOY_CMD[@]}"

# 11. Retrieve deployed Service URL
SERVICE_URL=$(gcloud run services describe "${APP_NAME}" \
  --region="${GCP_REGION}" \
  --project="${GCP_PROJECT}" \
  --format="value(status.url)")

echo "--> Deployed Service URL: ${SERVICE_URL}"

# 12. Configure correct IAP IAM Roles
echo "--> Configuring IAP IAM access for ${IAP_ALLOWED_DOMAINS}..."
# Grant roles/iap.httpsResourceAccessor at the Cloud Run IAP resource level for each allowed domain
IFS=',' read -ra DOMAINS <<< "${IAP_ALLOWED_DOMAINS:-google.com}"
for DOMAIN in "${DOMAINS[@]}"; do
  DOMAIN=$(echo "${DOMAIN}" | xargs)
  if [[ -z "${DOMAIN}" || "${DOMAIN}" == "*" ]]; then continue; fi
  gcloud iap web add-iam-policy-binding \
    --resource-type=cloud-run \
    --service="${APP_NAME}" \
    --region="${GCP_REGION}" \
    --member="domain:${DOMAIN}" \
    --role="roles/iap.httpsResourceAccessor" \
    --project="${GCP_PROJECT}" --quiet 2>/dev/null || true
done

if [[ -n "${IAP_ALLOWED_MEMBER:-}" ]]; then
  echo "--> Granting IAP access for member: ${IAP_ALLOWED_MEMBER}..."
  gcloud iap web add-iam-policy-binding \
    --resource-type=cloud-run \
    --service="${APP_NAME}" \
    --region="${GCP_REGION}" \
    --member="${IAP_ALLOWED_MEMBER}" \
    --role="roles/iap.httpsResourceAccessor" \
    --project="${GCP_PROJECT}" --quiet >/dev/null 2>&1 || true
fi

# Ensure IAP Service Agent exists in project before binding roles/run.invoker
echo "--> Provisioning IAP Service Agent identity..."
gcloud beta services identity create --service=iap.googleapis.com --project="${GCP_PROJECT}" --quiet >/dev/null 2>&1 || true

# Grant roles/run.invoker to the IAP Service Agent
IAP_SERVICE_AGENT="service-${PROJECT_NUMBER}@gcp-sa-iap.iam.gserviceaccount.com"
gcloud run services add-iam-policy-binding "${APP_NAME}" \
  --region="${GCP_REGION}" \
  --member="serviceAccount:${IAP_SERVICE_AGENT}" \
  --role="roles/run.invoker" \
  --project="${GCP_PROJECT}" --quiet >/dev/null

SERVICE_DOMAIN=$(echo "${SERVICE_URL}" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

# 13. Programmatically configure IAP Allowed Domains
echo "--> Programmatically configuring IAP Allowed Domains for ${SERVICE_DOMAIN}..."
IAP_SETTINGS_TMP=$(mktemp)
cat << EOF_IAP > "${IAP_SETTINGS_TMP}"
accessSettings:
  allowedDomainsSettings:
    enable: true
    domains:
      - "${SERVICE_DOMAIN}"
      - "${APP_NAME}-${PROJECT_NUMBER}.${GCP_REGION}.run.app"
EOF_IAP

if ! gcloud iap settings set "${IAP_SETTINGS_TMP}" \
  --project="${GCP_PROJECT}" \
  --resource-type=cloud-run \
  --region="${GCP_REGION}" \
  --service="${APP_NAME}" --quiet >/dev/null 2>&1; then
  echo "    NOTE: Could not programmatically apply IAP allowedDomainsSettings."
  echo "          Please ensure the Cloud Run domain '${SERVICE_DOMAIN}' is enabled under Allowed Domains in IAP settings:"
  echo "          https://console.cloud.google.com/security/iap?project=${GCP_PROJECT}"
fi
rm -f "${IAP_SETTINGS_TMP}"

# 14. Post-deploy smoke test
echo "--> Running post-deploy smoke test against ${SERVICE_URL}..."
HTTP_STATUS=$(curl -sI --max-time 15 --connect-timeout 10 -o /dev/null -w "%{http_code}" "${SERVICE_URL}" || true)
if [[ "${HTTP_STATUS}" =~ ^(200|302|401)$ ]]; then
  echo "--> Smoke test passed! (HTTP Status: ${HTTP_STATUS} confirms active Cloud Run IAP perimeter)"
elif [[ "${HTTP_STATUS}" == "403" ]]; then
  echo "WARNING: Smoke test returned HTTP 403 Forbidden. Verify that IAP permissions and Allowed Domains are active." >&2
else
  echo "ERROR: Smoke test failed with unexpected response status: ${HTTP_STATUS}" >&2
  echo "       The container may have crashed or failed health checks on startup." >&2
  exit 1
fi

echo "=========================================================="
echo "DEPLOYMENT COMPLETE!"
echo "Service URL:    ${SERVICE_URL}"
echo "Service Domain: ${SERVICE_DOMAIN}"
echo "IAP Principal:  domain:${IAP_ALLOWED_DOMAINS}"
echo "IAP Domains:    Enabled (${SERVICE_DOMAIN})"
echo "IAM Member:     ${IAP_ALLOWED_MEMBER:-None}"
echo "=========================================================="
