# API Contract — IT Asset Management System

## Base URLs

| Environment | URL |
|---|---|
| Local Frontend | http://localhost |
| Local Backend API | http://localhost:8000/api/v1 |
| Local Swagger UI | http://localhost:8000/api/v1/docs |
| Production Frontend | https://manajemenaset.up.railway.app |
| Production API (Backend) | https://backend-production-1fe2.up.railway.app/api/v1 |
| Production Swagger UI | https://backend-production-1fe2.up.railway.app/api/v1/docs |

**Note**: On Railway, backend and frontend are deployed as separate services. Swagger UI is accessible at the backend URL (`/api/v1/docs`). The frontend uses `FRONTEND_API_BASE_URL` environment variable to connect to the backend.

All API endpoints use the `/api/v1` prefix unless otherwise noted.

## Authentication

Protected endpoints require a JWT access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

Token obtained from:

```http
POST /api/v1/auth/login
```

Token expiry is configured by `ACCESS_TOKEN_EXPIRE_MINUTES` and defaults to `30` minutes.

## Error Response Format

All API errors use this format unless the gateway returns a custom response:

```json
{
"detail": "Error message description"
}
```

Gateway rate-limit response:

```json
{
"detail": "Too many requests. Please try again later."
}
```

| Status Code | Meaning |
|---:|---|
| 200 | Success |
| 201 | Created |
| 204 | Deleted / no content |
| 400 | Bad request |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / insufficient role |
| 404 | Resource not found |
| 422 | Validation error |
| 429 | Rate limited |
| 500 | Server error |
| 503 | Service unavailable / database unavailable |

## Rate Limits

Rate limits are configured in `backend/nginx.conf`.

| Zone | Rate | Burst | Target |
|---|---:|---:|---|
| `auth_limit` | 5 req/s | 10 | `POST /api/v1/auth/login` |
| `auth_limit` | 5 req/s | 5 | `POST /api/v1/auth/register` |
| `general_limit` | 30 req/s | 20 | Other auth routes |
| `api_limit` | 20 req/s | 30 | General API routes |
| `general_limit` | 30 req/s | 50 | Frontend/static routes |

## Authentication Endpoints

### POST `/api/v1/auth/register`

Rate limit: 5 req/s
Auth: Not required

Request body:

```json
{
"username": "string",
"email": "user@example.com",
"full_name": "string",
"role": "user",
"is_active": true,
"password": "StrongPass123"
}
```

Validation rules:

- `username`: 3–50 characters, trimmed
- `email`: valid email format
- `full_name`: max 200 characters
- `password`: 8–128 characters, must include uppercase and digit

Response 201:

```json
{
"id": 1,
"username": "string",
"email": "user@example.com",
"full_name": "string",
"role": "user",
"is_active": true,
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00"
}
```

### POST `/api/v1/auth/login`

Rate limit: 5 req/s
Auth: Not required

Request body (`application/x-www-form-urlencoded`):

```text
username=admin&password=admin123
```

Response 200:

```json
{
"access_token": "eyJhbGciOiJIUzI1NiIs...",
"token_type": "bearer",
"user": {
"id": 1,
"username": "admin",
"email": "admin@example.com",
"full_name": "Admin",
"role": "admin",
"is_active": true,
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00"
}
}
```

### GET `/api/v1/auth/me`

Auth: Required

Response 200:

```json
{
"id": 1,
"username": "admin",
"email": "admin@example.com",
"full_name": "Admin",
"role": "admin",
"is_active": true,
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00"
}
```

## Users Endpoints

All user management endpoints require Manager or Admin.

### GET `/api/v1/users`

Response 200:

```json
[
{
"id": 1,
"username": "admin",
"email": "admin@example.com",
"full_name": "Admin",
"role": "admin",
"is_active": true,
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00"
}
]
```

### GET `/api/v1/users/{id}`

Response 200:

```json
{
"id": 1,
"username": "admin",
"email": "admin@example.com",
"full_name": "Admin",
"role": "admin",
"is_active": true,
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00",
"created_assets": [],
"asset_count": 0
}
```

### POST `/api/v1/users`

Request body:

```json
{
"username": "it",
"email": "it@example.com",
"full_name": "IT Staff",
"role": "manager",
"is_active": true,
"password": "StrongPass123"
}
```

Response 201: `UserRead`

### PUT `/api/v1/users/{id}`

Request body: partial `UserUpdate`

```json
{
"email": "it-new@example.com",
"full_name": "IT Staff Updated",
"role": "manager",
"is_active": true,
"password": "StrongPass456"
}
```

Response 200: `UserRead`

### DELETE `/api/v1/users/{id}`

Response 204: No content

## Assets Endpoints

### GET `/api/v1/assets`

Auth: Not required
Query parameters:

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `status` | enum | No | Filter by asset status |
| `category_id` | integer | No | Filter by category ID |

Response 200:

```json
[
{
"id": 1,
"asset_code": "LAP-001",
"name": "MacBook Pro M3",
"type": "Laptop",
"category_id": 1,
"location": "IT Room",
"location_id": 1,
"status": "Available",
"quantity": 5,
"assigned_to": "Unassigned",
"purchase_date": "2026-01-01",
"last_update": "2026-06-13",
"condition": "Excellent",
"serial_number": "SN-001",
"brand": "Apple",
"model": "MBP-M3",
"ip_address": null,
"mac_address": null,
"created_by": 1,
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00",
"category": null,
"location_ref": null
}
]
```

### POST `/api/v1/assets`

Auth: Required

Request body:

```json
{
"asset_code": "LAP-001",
"name": "MacBook Pro M3",
"type": "Laptop",
"category_id": 1,
"location": "IT Room",
"location_id": 1,
"status": "Available",
"quantity": 5,
"assigned_to": "Unassigned",
"purchase_date": "2026-01-01",
"last_update": "2026-06-13",
"condition": "Excellent",
"serial_number": "SN-001",
"brand": "Apple",
"model": "MBP-M3",
"ip_address": "192.168.1.10",
"mac_address": "AA:BB:CC:DD:EE:FF",
"created_by": 1
}
```

Validation rules:

- `asset_code`, `name`, `type`: required, trimmed, non-empty
- `category_id`, `location_id`: positive integer when provided
- `quantity`: 0–999,999
- string fields are capped to prevent oversized input

Response 201: `AssetRead`

### GET `/api/v1/assets/{id}`

Auth: Not required
Response 200: `AssetRead`

### PUT `/api/v1/assets/{id}`

Auth: Required
Request body: partial `AssetUpdate`
Response 200: `AssetRead`

### DELETE `/api/v1/assets/{id}`

Auth: Required
Response 204: No content

## Categories Endpoints

### GET `/api/v1/categories`

Auth: Not required
Response 200: `CategoryRead[]`

### POST `/api/v1/categories`

Auth: Required

Request body:

```json
{
"name": "Hardware",
"description": "Physical IT devices"
}
```

Response 201: `CategoryRead`

### GET `/api/v1/categories/{id}`

Auth: Not required
Response 200: `CategoryRead`

### PUT `/api/v1/categories/{id}`

Auth: Required
Request body: partial `CategoryUpdate`
Response 200: `CategoryRead`

### DELETE `/api/v1/categories/{id}`

Auth: Required
Response 204: No content

## Locations Endpoints

### GET `/api/v1/locations`

Auth: Not required

Response 200:

```json
[
{
"id": 1,
"name": "IT Room",
"address": "Building A",
"created_at": "2026-06-13T00:00:00",
"updated_at": "2026-06-13T00:00:00",
"asset_count": 12
}
]
```

### POST `/api/v1/locations`

Auth: Required

Request body:

```json
{
"name": "IT Room",
"address": "Building A"
}
```

Response 201: `LocationRead`

### GET `/api/v1/locations/{id}`

Auth: Not required
Response 200: `LocationRead`

### PUT `/api/v1/locations/{id}`

Auth: Required
Request body: partial `LocationUpdate`
Response 200: `LocationRead`

### DELETE `/api/v1/locations/{id}`

Auth: Required
Response 204: No content

## Asset Types Endpoints

### GET `/api/v1/asset-types`

Auth: Not required
Response 200: `AssetTypeRead[]`

### POST `/api/v1/asset-types`

Auth: Required

Request body:

```json
{
"name": "Laptop",
"category": "Hardware"
}
```

Response 201: `AssetTypeRead`

### PUT `/api/v1/asset-types/{id}`

Auth: Required
Request body: partial `AssetTypeUpdate`
Response 200: `AssetTypeRead`

### DELETE `/api/v1/asset-types/{id}`

Auth: Required
Response 204: No content

## Borrow Logs Endpoints

### POST `/api/v1/borrow-logs`

Auth: Manager/Admin

Request body:

```json
{
"asset_id": 1,
"user_name": "John Doe",
"department": "IT Support",
"notes": "Borrowed for maintenance"
}
```

Response 201: `BorrowLogRead`

### POST `/api/v1/borrow-logs/{id}/return`

Auth: Manager/Admin

Request body:

```json
{
"notes": "Returned in good condition"
}
```

Response 200: `BorrowLogRead`

### GET `/api/v1/borrow-logs`

Auth: Required
Response 200: `BorrowLogRead[]`

### GET `/api/v1/borrow-logs/asset/{asset_id}`

Auth: Required
Response 200: `BorrowLogRead[]`

## Transactions Endpoints

### GET `/api/v1/transactions`

Auth: Required
Response 200: `TransactionRead[]`

### POST `/api/v1/transactions`

Auth: Required

Request body:

```json
{
"asset_id": 1,
"from_location_id": 1,
"to_location_id": 2,
"transaction_type": "in",
"quantity": 1,
"notes": "Stock adjustment"
}
```

Response 201: `TransactionRead`

### GET `/api/v1/transactions/{id}`

Auth: Required
Response 200: `TransactionRead`

### PUT `/api/v1/transactions/{id}`

Auth: Required
Request body: partial `TransactionUpdate`
Response 200: `TransactionRead`

### DELETE `/api/v1/transactions/{id}`

Auth: Required
Response 204: No content

## Conditions Endpoints

### GET `/api/v1/conditions`

Auth: Required

Response 200:

```json
[
{
"id": 1,
"name": "Excellent",
"description": "Kondisi sempurna, seperti baru",
"color": "#10B981",
"bgColor": "#ECFDF5",
"assetCount": 3
}
]
```

### GET `/api/v1/conditions/{condition_name}`

Auth: Required
Response 200:

```json
{
"condition": "Excellent",
"asset_count": 3,
"assets": []
}
```

### PUT `/api/v1/conditions/{condition_name}/update-description`

Auth: Required
Response 200:

```json
{
"message": "Description for Excellent updated successfully",
"condition": "Excellent",
"description": "Updated description"
}
```

## Health Endpoints

### GET `/api/v1/health`

Auth: Not required

Response 200:

```json
{
"status": "healthy"
}
```

Response 503:

```json
{
"detail": "database unavailable: ..."
}
```
