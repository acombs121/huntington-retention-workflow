# =====================================================================
# Standard Multi-Stage Cloud Run Dockerfile
# Stage 1: Build React/Vite Frontend
# Stage 2: Serve API + Static Frontend via Python FastAPI
# =====================================================================

# --- Stage 1: Build Frontend Static Bundle ---
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Python FastAPI Backend ---
FROM python:3.11-slim
WORKDIR /app

# Create non-root user for hardened runtime execution
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

ENV PYTHONUNBUFFERED=1
ENV APP_ENV=production

# Layer caching: Install Python dependencies first
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code with non-root ownership (avoids duplicate layer)
COPY --chown=appuser:appuser . ./
# Copy built frontend assets from Stage 1 into dist/
COPY --chown=appuser:appuser --from=build-frontend /app/frontend/dist /app/dist

USER appuser

# Cloud Run injects $PORT (default 8080); container MUST bind to 0.0.0.0:$PORT
CMD exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8080}" --proxy-headers --forwarded-allow-ips='*'
