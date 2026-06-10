# API Contract

Base URL (gateway): `http://<production-host>`

Authentication
- All protected endpoints require `Authorization: Bearer <token>` header.
- Tokens obtained from `POST /api/v1/auth/login` and expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.

Endpoints (summary)
- `POST /api/v1/auth/register` — register user
- `POST /api/v1/auth/login` — login, returns JWT
- `GET /api/v1/auth/me` — current user
- `GET /api/v1/health` — health check
- `GET /api/v1/categories` — list categories
- `GET /api/v1/asset-types` — list asset types
- `GET /api/v1/assets` — list assets
- `POST /api/v1/assets` — create asset (auth required)
- `GET /api/v1/transactions` — list transactions
- `POST /api/v1/transactions` — create transaction

Error format
```
{ "detail": "Error message" }
```

Notes
- See full interactive API docs at `/docs` when running the server.
