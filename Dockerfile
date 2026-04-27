# syntax=docker/dockerfile:1.4
# Multi-stage build for IT Asset Management (Frontend + Backend in one container)
# Requires BuildKit: DOCKER_BUILDKIT=1 docker build ...

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build Frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS frontend-builder

WORKDIR /app/frontend

# Copy file dependency list
COPY frontend/package.json frontend/bun.lock ./

# Install dependencies dengan bun (sangat cepat, dan file bun.lock menjamin versi akurat)
RUN bun install

# Copy source code penuh
COPY frontend/ ./

# Build static assets dengan bun
RUN bun run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Python dependencies (layer terpisah agar ter-cache)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS python-deps

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /install

# Hanya copy requirements production (bukan requirements.txt penuh yang
# mengandung pytest, httpx, psycopg[binary] untuk PostgreSQL, dll.)
COPY backend/requirements-prod.txt requirements.txt

# --mount=type=cache menyimpan cache pip di host (tidak masuk image)
# --prefix menaruh hasil install ke /install/packages agar mudah di-copy
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --prefix=/install/packages -r requirements.txt

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Runtime (image final)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/install/packages/lib/python3.12/site-packages \
    DATABASE_URL="sqlite:////data/it_asset.db"

WORKDIR /app

# Install HANYA runtime dependencies sistem:
#   - nginx   : reverse proxy untuk serve frontend + forward /api ke uvicorn
#   - supervisor: proses manager untuk nginx & uvicorn dalam satu container
#   - curl    : diperlukan oleh HEALTHCHECK
# rm -rf /var/lib/apt/lists/* menghapus APT cache agar layer tetap kecil
RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages dari stage python-deps (bukan re-install)
COPY --from=python-deps /install/packages /usr/local

# Copy backend source code
COPY backend/ ./

# Copy built frontend dari stage frontend-builder ke direktori nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# ── Nginx & Supervisord configuration ──────────────────────────────────────────
# Kita COPY konfigurasi yang dibuat di root backend, sehingga lebih bersih 
# dan tidak terkena issue parsing here-doc pada line-endings windows
COPY backend/nginx.conf /etc/nginx/sites-available/default
COPY backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ─────────────────────────────────────────────────────────────────────────────

# Volume untuk SQLite database (persisten di luar container)
VOLUME ["/data"]

# Hanya expose port 80 (port 8000 internal saja, tidak perlu ke host)
EXPOSE 80

# Healthcheck menggunakan curl (sudah terinstall di atas)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost/ || exit 1

# Jalankan supervisord yang akan mengelola nginx dan uvicorn
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
