# Deployment Guide

This guide covers deploying the full stack to a production environment (example: Railway, any VPS, or container host).

1. Prepare environment secrets (do NOT commit these to git):
    - `SECRET_KEY`: random 32+ character string
    - `DATABASE_URL`: production Postgres connection string
    - `ALLOW_ORIGINS`: production frontend domain(s) (comma-separated)
    - `GHCR_TOKEN`, `GHCR_USERNAME` for image push (if using GHCR)

2. Railway auto-deploys from GitHub on `main`, so no separate GitHub Actions CD workflow is required.

3. Gateway Nginx config is in `nginx.conf` at project root (includes rate limiting).

4. Environment variables for production `docker-compose.prod.yml` or platform:
    - `APP_ENV=production`
    - `SECRET_KEY` (set securely)
    - `DATABASE_URL` (set securely)
    - `ALLOW_ORIGINS=https://manajemenaset.up.railway.app`

5. Frontend service requires `FRONTEND_API_BASE_URL` set to backend URL:
    - `FRONTEND_API_BASE_URL=https://backend-production-1fe2.up.railway.app/api/v1`

6. Start services (example with Docker Compose):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

6. Verify health and logs:
```bash
curl -f https://backend-production-1fe2.up.railway.app/api/v1/health
# Swagger UI: https://backend-production-1fe2.up.railway.app/docs
```

7. Post-deploy checklist:
- Ensure rate limiting and CORS are configured correctly
- Ensure secrets stored in secret manager or env system
- Run smoke tests and basic demo flow
