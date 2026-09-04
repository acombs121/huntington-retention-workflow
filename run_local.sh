#!/usr/bin/env bash
# =====================================================================
# Local Development Execution Script
# Parameterized via .env - Binds strictly to 127.0.0.1 (No 0.0.0.0)
# =====================================================================
set -euo pipefail

# Handle help flag before requiring .env
for arg in "$@"; do
  if [[ "${arg}" == "--help" || "${arg}" == "-h" ]]; then
    echo "Usage: ./run_local.sh"
    echo ""
    echo "Runs the local FastAPI backend (127.0.0.1:8080) and Vite dev server (127.0.0.1:5173)."
    echo "Requires a configured .env file in the working directory (copy from example.env)."
    exit 0
  fi
done

if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found. Copy example.env to .env." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

# Validate / default variables before usage under set -u
: "${APP_NAME:=cloud-run-demo}"
: "${GEMINI_MODEL:=gemini-3.7-flash}"

# Explicit local environment overrides
export APP_ENV="local"
export DEBUG="true"
export IAP_ENABLED_LOCAL="false"
export LOCAL_HOST="127.0.0.1"

echo "=========================================================="
echo "Starting Local Development Environment: ${APP_NAME}"
echo "Environment: ${APP_ENV} | Host: ${LOCAL_HOST} | Port: ${LOCAL_PORT:-8080}"
echo "Gemini Model: ${GEMINI_MODEL}"
echo "=========================================================="

# Track background processes explicitly (avoids kill 0 terminating caller shell/IDE terminals)
BACKEND_PID=""
cleanup() {
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    echo ""
    echo "Shutting down backend server (PID ${BACKEND_PID})..."
    kill -TERM "${BACKEND_PID}" 2>/dev/null || true
    wait "${BACKEND_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# 1. Start Python FastAPI backend server
if [[ ! -d ".venv" ]]; then
  echo "--> Initializing Python virtual environment..."
  python3 -m venv .venv
fi
source .venv/bin/activate

if [[ -f requirements.txt ]]; then
  pip install -r requirements.txt --quiet
fi

python3 -m uvicorn main:app --host "${LOCAL_HOST}" --port "${LOCAL_PORT:-8080}" --reload &
BACKEND_PID=$!

# 2. Start React / Vite dev server if frontend directory exists
if [[ -d "frontend" ]]; then
  echo "--> Starting Vite dev server for React/Tailwind frontend..."
  (cd frontend && { [[ -d "node_modules" ]] || npm install --silent; } && LOCAL_PORT="${LOCAL_PORT:-8080}" npm run dev -- --host "${LOCAL_HOST}")
else
  wait "${BACKEND_PID}"
fi
