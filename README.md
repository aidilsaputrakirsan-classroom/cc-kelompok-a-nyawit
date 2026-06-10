# IT Asset Management System (Sistem Manajemen Aset IT)

## Tim Pengembang

| Nama | NIM | Peran |
|------|-----|-------|
| Ilham Ahmad Fahriji | 10231042 | Lead Backend & Lead DevOps |
| Putu Ngurah Semara | 10231075 | Lead Frontend & Lead QA & Docs |

## Deskripsi Proyek
Sistem Manajemen Aset IT adalah platform khusus yang dirancang untuk mengelola dan mendata seluruh infrastruktur perangkat keras perusahaan. Berbeda dengan sistem inventaris umum, aplikasi ini difokuskan pada kebutuhan spesifik departemen IT, mulai dari pengelolaan perangkat di *data center* hingga perangkat *endpoint* yang digunakan oleh karyawan.

Sistem ini membantu administrator IT dalam menjaga transparansi distribusi aset, memantau kesehatan perangkat, serta memastikan efisiensi dalam perencanaan kapasitas jaringan dan server.

## Teknologi yang Digunakan

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + TypeScript | React 18 |
| **Build Tool** | Vite | Latest |
| **Styling** | Tailwind CSS | Latest |
| **UI Components** | Radix UI | Latest |
| **Package Manager** | Bun | Latest |
| **Icons** | Lucide React | Latest |
| **Backend** | FastAPI (Python) | 3.12 |
| **Database** | SQLite / PostgreSQL | - |
| **ORM** | SQLAlchemy | Latest |
| **Auth** | JWT (Python-Jose) | Latest |
| **Server** | Uvicorn | Latest |
| **Web Server** | Nginx | Latest |
| **Container** | Docker | Latest |
| **Process Manager** | Supervisord | Latest |

### Arsitektur Microservices (Docker Pattern)

```mermaid
graph TD
    Client([Client Browser]) -->|Akses UI| Frontend[Frontend Service <br/> React + Nginx]
    Client -->|REST API HTTP| Backend[Backend Service <br/> FastAPI]
    Backend -->|Koneksi Data| DB[(Database Service <br/> PostgreSQL / SQLite)]
```

- **Frontend service**: Build React/Vite di image terpisah lalu diserve oleh Nginx
- **Backend service**: FastAPI berjalan sendiri di container Python terpisah
- **Database service**: PostgreSQL terpisah untuk deployment Railway dan environment production
- **Runtime config**: Frontend membaca base URL API dari `config.js` agar bisa diarahkan ke backend Railway

---

## Cara Menjalankan

### Pengembangan (Development)

#### Frontend
```bash
cd frontend
bun install
bun dev
```
Aplikasi frontend berjalan di: **http://localhost:5173/**

Backend harus berjalan secara terpisah (lihat bagian Backend di bawah).

#### Backend dengan Docker
```bash
docker compose up -d --build
```

#### Backend tanpa Docker
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Buat database SQLite atau configure PostgreSQL
# Untuk development: gunakan `--reload` agar server otomatis restart saat kode berubah
# (Hanya untuk development)
uvicorn app.main:app --reload

# Untuk produksi: jalankan tanpa `--reload` dan gunakan process manager atau container
# Contoh (langsung menjalankan uvicorn untuk production):
# uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Backend API: **http://localhost:8000**

---

### Produksi dengan Docker (Tiga Service Terpisah)

#### Prerequisites
- Docker Desktop terinstall
- Docker Compose terinstall

#### Langkah Menjalankan
```bash
# Clone dan masuk ke direktori project
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-nyawit.git
cd cc-kelompok-a-nyawit

# Build dan jalankan tiga service terpisah
docker compose up -d --build

# Cek status container
docker compose ps
```

#### Akses Aplikasi

| Service | URL | Keterangan |
|---------|-----|-----------|
| Frontend | https://manajemenaset.up.railway.app | Halaman utama (React) |
| API | https://manajemenaset.up.railway.app/api/v1 | Backend API |
| Swagger UI | https://manajemenaset.up.railway.app/api/v1/docs | Dokumentasi API Interaktif |
| ReDoc | https://manajemenaset.up.railway.app/api/v1/redoc | Dokumentasi API (ReDoc) |

### Deploy ke Railway

Deployment production dijalankan langsung oleh Railway auto-deploy dari GitHub. Jadi workflow CD GitHub Actions tidak dipakai untuk proyek ini.

Gunakan tiga service terpisah:
1. **Frontend**: set root ke folder `frontend/` dan build dari [frontend/Dockerfile](frontend/Dockerfile).
2. **Backend**: set root ke folder `backend/` dan build dari [backend/Dockerfile](backend/Dockerfile).
3. **Database**: pakai service PostgreSQL Railway, lalu isi `DATABASE_URL` di backend dengan connection string PostgreSQL dari Railway.

Untuk frontend, set `FRONTEND_API_BASE_URL` ke URL publik backend Railway, misalnya `https://manajemenaset.up.railway.app/api/v1`.
Untuk backend, set `DATABASE_URL` ke URL PostgreSQL Railway, misalnya `postgresql+psycopg://...`.

#### Default Users
Setelah container berjalan, sistem membuat user default:
- **Admin:** username=`admin`, password=`admin123`
- **IT Staff:** username=`it`, password=`it123`
- **Tech Support:** username=`tech`, password=`tech123`

**PENTING:** Ganti password default setelah login pertama!

#### Hentikan Container
```bash
docker compose down
```

Untuk menghapus volume data:
```bash
docker compose down -v
```

---

## Troubleshooting Docker

### Masalah: Container Selalu Restart Loop

**Gejala:** Container terus mencoba restart

**Penyebab:** Health check gagal atau service belum selesai start

**Solusi:**
1. Pastikan service database sudah siap sebelum backend start.
2. Cek logs dengan `docker compose logs`.
3. Untuk frontend, pastikan `FRONTEND_API_BASE_URL` mengarah ke backend yang benar.

### Masalah: 502 Bad Gateway

**Penyebab:** Frontend tidak bisa mengakses backend.

**Solusi:**
1. Cek backend berjalan di port 8000.
2. Pastikan `FRONTEND_API_BASE_URL` mengarah ke URL backend yang benar.
3. Saat Railway, pastikan URL backend publik sudah dipakai, bukan `localhost`.

### Masalah: Database Error

**Penyebab:** Permission atau path database salah

**Solusi:**
1. Cek folder data ada dan dapat ditulis:
```bash
ls -la data/
```
2. Jika menggunakan Docker Desktop pada Windows, gunakan WSL2 backend

---

## Struktur API

### Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | / | Health check root |
| GET | /api/v1/health | Health check API |
| POST | /api/v1/auth/register | Register user baru |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/auth/me | Get current user |
| GET | /api/v1/users | List users (admin) |
| GET | /api/v1/categories | List kategori |
| POST | /api/v1/categories | Create kategori |
| GET | /api/v1/locations | List lokasi |
| POST | /api/v1/locations | Create lokasi |
| GET | /api/v1/assets | List aset |
| POST | /api/v1/assets | Create aset |
| GET | /api/v1/assets/{id} | Get aset |
| PUT | /api/v1/assets/{id} | Update aset |
| DELETE | /api/v1/assets/{id} | Delete aset |
| GET | /api/v1/borrow-logs | List log peminjaman |
| POST | /api/v1/borrow-logs | Create log peminjaman |
| GET | /api/v1/conditions | List kondisi aset |

### Role & Permissions

| Endpoint | Admin | Manager | User |
|----------|-------|---------|------|
| GET categories | ✅ | ✅ | ✅ |
| POST categories | ✅ | ✅ | ❌ |
| PUT/DELETE categories | ✅ | ✅ | ❌ |
| GET assets | ✅ | ✅ | ✅ |
| POST/PUT/DELETE assets | ✅ | ✅ | ❌ |
| GET borrow-logs | ✅ | ✅ | ✅ |
| POST borrow-logs | ✅ | ✅ | ❌ |
| GET users | ✅ | ✅ | ❌ |
| POST/PUT/DELETE users | ✅ | ❌ | ❌ |

---

## Contoh Penggunaan API

### 1. Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

### 2. Menggunakan Token
```bash
curl -X GET "http://localhost:8000/api/v1/assets" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 3. Create Aset Baru
```bash
curl -X POST "http://localhost:8000/api/v1/assets" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "asset_code": "LAP-001",
    "name": "MacBook Pro M3",
    "type": "Laptop",
    "category_id": 1,
    "location_id": 1,
    "status": "Available",
    "condition": "Excellent"
  }'
```

---

## Fitur Utama

### 1. Manajemen Data Barang (Asset Inventory)
- Pencatatan detail teknis (Serial Number, Brand, Model, Spesifikasi)
- ID unik untuk setiap aset

### 2. Kategorisasi Aset
- Hardware (Server, Laptop, Desktop)
- Software (Lisensi)
- Peripherals (Monitor, Keyboard, dll)

### 3. Pemetaan Lokasi Fisik
- Rack di data center
- Ruang kantor
- Gudang penyimpanan

### 4. Status Aset
- Available (Tersedia)
- In Use (Sedang Dipakai)
- Under Maintenance (Perbaikan)
- Retired (Decommissioned)

### 5. Kondisi Aset
- Excellent
- Good
- Fair
- Poor

### 6. Log Peminjaman
Riwayat peminjaman dan pengembalian aset

### 7. Autentikasi JWT
- Role-based Access Control (Admin, Manager, User)
- Token-based authentication

---

## Environment Variables

### Docker
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| DATABASE_URL | sqlite:////data/it_asset.db | Database connection string |
| SECRET_KEY | your-super-secret-key-change-in-production | JWT secret key |
| APP_ENV | production | Environment (development/production) |

### Development (Backend)
Buat file `.env` di folder `backend/` (contoh):
```env
APP_NAME=IT Asset Management API
APP_ENV=development
DATABASE_URL=sqlite:///data/it_asset.db
# Ganti dengan string acak kuat untuk production (minimal 32 karakter)
SECRET_KEY=CHANGE_ME_USE_RANDOM_STRING_MIN_32_CHARS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Production Security Checklist

- Pastikan `SECRET_KEY`, `DATABASE_URL`, dan `ALLOW_ORIGINS` di-set di environment produksi.
- Jangan gunakan `ALLOW_ORIGINS=*` di produksi — set ke domain frontend Anda.
- Pastikan gateway Nginx rate limiting di-deploy di lingkungan produksi (lihat `backend/nginx.conf`).
- Jangan menjalankan `uvicorn --reload` di produksi; gunakan proses manager atau container orchestration.

---

## Struktur Folder

```
cc-kelompok-a-nyawit/
├── frontend/                 # React Frontend
│   ├── app/                 # Main app component
│   ├── components/           # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── AssetTable.tsx  # Asset table
│   │   └── MetricCards.tsx # Dashboard metrics
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── AssetManagementPage.tsx
│   │   └── ...
│   ├── lib/                # Utilities & API
│   └── dist/               # Production build
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Config & Security
│   │   ├── db/            # Database
│   │   ├── models/        # SQLAlchemy models
│   │   └── schemas/       # Pydantic schemas
│   ├── database/          # SQL schema
│   └── requirements.txt
├── data/                    # SQLite database (created at runtime)
├── docker-compose.yml       # Docker compose config
├── Dockerfile             # Multi-stage Dockerfile
└── README.md              # This file
```

---

## Lisensi & Credits

- Proyek ini merupakan bagian dari tugas Cloud Computing Kelompok A Nyawit.
- **Framework:** React, FastAPI, SQLite/PostgreSQL, Nginx, Supervisord

## Test GitHub Actions Trigger

This line was added to trigger the CI pipeline.

### Ilham Ahmad Fahriji (10231042)
**Lead Backend & Lead DevOps**
- Merancang dan mengembangkan REST API dengan FastAPI
- Mengimplementasikan sistem autentikasi JWT dan RBAC
- Mengatur database dengan SQLAlchemy
- Membuat Docker container dan docker-compose
- Mengkonfigurasi Nginx sebagai reverse proxy
- Mengelola deployment dan CI/CD

### Putu Ngurah Semara (10231075)
**Lead Frontend & Lead QA & Docs**
- Merancang dan mengembangkan UI dengan React + TypeScript
- Mengimplementasikan desain dengan Tailwind CSS dan Radix UI
- Mengintegrasikan frontend dengan backend API
- Membuat dokumentasi API dengan Swagger UI
- Menguji fungsionalitas sistem secara menyeluruh
- Menulis dokumentasi proyek dan user guide

---

## Project Journey

Aplikasi ini berevolusi dari sebuah sistem terpadu (monolith-like) menjadi arsitektur berbasis container (microservices-ready). Perubahan ini dilakukan untuk meningkatkan skalabilitas dan memudahkan deployment di lingkungan cloud (seperti Railway).

1. **Fase 1: Monolith Sederhana**
   Pada awalnya, frontend dan backend berjalan di satu environment pengembangan menggunakan SQLite lokal untuk penyimpanan sementara, tanpa pembagian service yang kaku.

2. **Fase 2: Pemisahan Frontend & Backend**
   Memisahkan proses build dan run menjadi dua entitas independen (React Vite & FastAPI). Keduanya dikomunikasikan melalui REST API yang terdefinisi dengan jelas menggunakan OpenAPI/Swagger.

3. **Fase 3: Containerization & Docker**
   Setiap komponen (*Frontend*, *Backend*, *Database*) dibungkus menjadi Docker *container* terpisah menggunakan `docker-compose`. Hal ini memastikan konsistensi dari tahap *development* hingga ke *production*.

4. **Fase 4: Microservices-Ready & Cloud Deployment**
   Sistem diatur ulang sehingga dapat di-*deploy* secara mandiri (*independent scaling*). Frontend dikelola oleh *web server* statis (Nginx), Backend berjalan sebagai API *gateway/service* mandiri, dan *Database* sepenuhnya dipisahkan menjadi *managed service* PostgreSQL di cloud (Railway).