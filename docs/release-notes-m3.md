# Release Notes — Milestone 3 (Final)

## Version: 3.0.0
**Release Date:** 2026-06-13  
**Tag:** v3.0.0  
**Project:** IT Asset Management System — Kelompok A Nyawit

## 🆕 Fitur Baru (dari Milestone 2)

### Gateway & Production Readiness
- Nginx gateway configuration added in `backend/nginx.conf`
- Rate limiting for auth, API, and general routes
- JSON 429 response for rate-limited requests
- Frontend and backend can be deployed with Docker Compose
- Runtime API origin supported through frontend runtime config

### Security Hardening
- JWT authentication with expiry
- bcrypt password hashing
- Stronger Pydantic validation for user and asset inputs
- Password strength validation for registration and user updates
- Field length and numeric range validation for asset management
- CORS configured through `ALLOW_ORIGINS`
- Production `SECRET_KEY` validation in backend settings

### Code Quality & Consistency
- Dead code removed from backend
- Unconditional frontend debug logging removed
- Backend formatter configuration added with Black and isort
- Frontend formatter configuration added with Prettier
- README, API contract, deployment guide, and release notes updated

### Monitoring & Operations
- Backend health check available at `/api/v1/health`
- Docker healthcheck configured for backend service
- Structured Python logging retained for operational debugging
- Deployment guide documents Railway and Docker Compose usage

## 🔧 Maintenance

### Fixes
- Removed unused duplicate transaction route code
- Cleaned frontend asset hook debug logs
- Fixed Nginx gateway config structure so `limit_req_zone` is placed inside the `http` block
- Updated documentation to match the current project structure

## 📊 Statistik Proyek

| Metric | Nilai |
|---|---:|
| Total Services | 3 (backend, frontend, database) |
| Total Main Endpoints | 40 |
| Auth Endpoints | 3 |
| Asset Management Endpoints | 5 |
| Category Endpoints | 5 |
| Location Endpoints | 5 |
| Borrow Log Endpoints | 4 |
| Transaction Endpoints | 5 |
| Unit Tests | Existing smoke/auth/user tests |
| Integration Tests | Docker smoke tests available in `tools/` |
| CI Pipeline Jobs | GitHub Actions workflow |
| Total Commits | See GitHub history |
| Total PRs Merged | See GitHub pull requests |

## 🐛 Known Issues

- Nginx gateway config is provided in `backend/nginx.conf` and should be reviewed before using it as the public production gateway.
- The app currently uses one backend API service rather than separate Auth and Item microservices.
- Some frontend API mappings assume seeded category IDs 1, 2, and 3.
- Metrics endpoint and dashboard are not implemented yet; health checks are the current operational monitoring surface.

## 👥 Kontribusi

| Nama | Commits | PRs | Areas |
|---|---:|---:|---|
| Ilham Ahmad Fahriji | See GitHub history | See GitHub PRs | Backend, JWT auth, database, Docker, Nginx gateway, deployment |
| Putu Ngurah Semara | See GitHub history | See GitHub PRs | Frontend, React UI, API integration, documentation, QA |

## ✅ Milestone 3 Checklist

- [x] README updated
- [x] API contract updated
- [x] Deployment guide updated
- [x] Release notes added
- [x] Rate limiting added to gateway config
- [x] Input validation strengthened
- [x] Dead code removed
- [x] Formatter configuration added
- [x] Docker Compose setup documented
- [x] Final documentation prepared for UAS
