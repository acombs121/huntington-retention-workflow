#!/usr/bin/env bash
# =====================================================================
# Automated Cloud Run Resource Teardown Script (destroy.sh)
# Parameterized via .env - Removes demo resources cleanly
# =====================================================================
set -euo pipefail

# Handle help flag before requiring .env
for arg in "$@"; do
  if [[ "${arg}" == "--help" || "${arg}" == "-h" ]]; then
    echo "Usage: ./destroy.sh [--force|-y] [--delete-secrets]"
    echo ""
    echo "Options:"
    echo "  --force, -y         Bypass confirmation prompt (required in non-interactive shells)"
    echo "  --delete-secrets    Delete Secret Manager secrets instead of just revoking IAM bindings"
    echo "  --help, -h          Show this help message"
    exit 0
  fi
done

if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found. Nothing to destroy." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

: "${GCP_PROJECT:?Missing GCP_PROJECT in .env}"
: "${GCP_REGION:?Missing GCP_REGION in .env}"
: "${APP_NAME:?Missing APP_NAME in .env}"
: "${SERVICE_ACCOUNT_NAME:?Missing SERVICE_ACCOUNT_NAME in .env}"

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT}.iam.gserviceaccount.com"
REPO_NAME="${APP_NAME}-repo"

DELETE_SECRETS_FLAG=false
FORCE_FLAG=false
for arg in "$@"; do
  if [[ "${arg}" == "--delete-secrets" ]]; then
    DELETE_SECRETS_FLAG=true
  fi
  if [[ "${arg}" == "--force" || "${arg}" == "-y" ]]; then
    FORCE_FLAG=true
  fi
done

echo "=========================================================="
echo "WARNING: You are about to DESTROY the following resources:"
echo "  - Cloud Run Service:  ${APP_NAME} (${GCP_REGION})"
echo "  - Artifact Registry:  ${REPO_NAME} (${GCP_REGION})"
echo "  - Service Account:    ${SERVICE_ACCOUNT_EMAIL}"
echo "  - Secret Manager:     ${REQUIRED_SECRETS:-None}"
echo "=========================================================="

if [[ "${FORCE_FLAG}" != "true" ]]; then
  if [[ -t 0 ]]; then
    read -p "Are you sure you want to proceed? (y/N): " CONFIRM
    if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
      echo "Teardown cancelled."
      exit 0
    fi
  else
    echo "ERROR: Non-interactive execution requires --force or -y flag." >&2
    exit 1
  fi
fi

gcloud config set project "${GCP_PROJECT}" --quiet

# 1. Delete Cloud Run service
if gcloud run services describe "${APP_NAME}" --region="${GCP_REGION}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "--> Deleting Cloud Run service: ${APP_NAME}..."
  gcloud run services delete "${APP_NAME}" --region="${GCP_REGION}" --project="${GCP_PROJECT}" --quiet
fi

# 2. Handle Secret Manager secrets (Revoke IAM *before* deleting Service Account)
if [[ -n "${REQUIRED_SECRETS:-}" ]]; then
  IFS=',' read -ra SECRETS <<< "${REQUIRED_SECRETS}"
  for SECRET_NAME in "${SECRETS[@]}"; do
    SECRET_NAME=$(echo "${SECRET_NAME}" | xargs)
    if [[ -z "${SECRET_NAME}" ]]; then continue; fi

    if [[ "${DELETE_SECRETS_FLAG}" == "true" ]]; then
      if gcloud secrets describe "${SECRET_NAME}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
        echo "--> Deleting Secret: ${SECRET_NAME}..."
        gcloud secrets delete "${SECRET_NAME}" --project="${GCP_PROJECT}" --quiet
      fi
    else
      echo "--> Revoking Service Account access for secret '${SECRET_NAME}' (Use --delete-secrets to delete secret data)..."
      gcloud secrets remove-iam-policy-binding "${SECRET_NAME}" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/secretmanager.secretAccessor" \
        --project="${GCP_PROJECT}" --quiet >/dev/null 2>&1 || true
    fi
  done
fi

# 3. Revoke project-level IAM binding before deleting SA
echo "--> Revoking project-level roles/aiplatform.user..."
gcloud projects remove-iam-policy-binding "${GCP_PROJECT}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/aiplatform.user" \
  --quiet >/dev/null 2>&1 || true

# 4. Delete Artifact Registry repository
if gcloud artifacts repositories describe "${REPO_NAME}" --location="${GCP_REGION}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "--> Deleting Artifact Registry repo: ${REPO_NAME}..."
  gcloud artifacts repositories delete "${REPO_NAME}" --location="${GCP_REGION}" --project="${GCP_PROJECT}" --quiet
fi

# 5. Delete runtime Service Account (last to prevent orphaned deleted: bindings)
if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "--> Deleting Service Account: ${SERVICE_ACCOUNT_NAME}..."
  gcloud iam service-accounts delete "${SERVICE_ACCOUNT_EMAIL}" --project="${GCP_PROJECT}" --quiet
fi

echo "=========================================================="
echo "TEARDOWN COMPLETE! All demo resources removed cleanly."
echo "=========================================================="
