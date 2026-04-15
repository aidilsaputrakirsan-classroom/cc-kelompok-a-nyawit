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

### Arsitektur deployment menggunakan Docker dengan pattern berikut:
- **Multi-stage Build**: Frontend di-build terlebih dahulu, kemudian hasil build-nya di-copy ke container final
- **Supervisord**: Mengelola proses Nginx dan Uvicorn secara bersamaan dalam satu container
- **Nginx**: Serve static frontend dan sebagai reverse proxy untuk API backend
- **SQLite**: Database disimpan di volume untuk persistensi data

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
cd backend
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
#汕头置 .env sesuai kebutuhan
uvicorn app.main:app --reload
```

Backend API: **http://localhost:8000**

---

### Produksi dengan Docker (Full Stack)

#### Prerequisites
- Docker Desktop terinstall
- Docker Compose terinstall

#### Langkah Menjalankan
```bash
# Clone dan masuk ke direktori project
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-nyawit.git
cd cc-kelompok-a-nyawit

# Build dan jalankan container
docker compose up -d --build

# Cek status container
docker compose ps
```

#### Akses Aplikasi

| Service | URL | Keterangan |
|---------|-----|-----------|
| Frontend | http://localhost | Halaman utama (React) |
| API | http://localhost:8000 | Backend API |
| Swagger UI | http://localhost:8000/docs | Dokumentasi API Interaktif |
| ReDoc | http://localhost:8000/redoc | Dokumentasi API (ReDoc) |

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

**Penyebab:** Health check gagal karena path salah

**Solusi:**
1. Pastikan menggunakan konfigurasi docker-compose.yml yang sudah diperbarui
2. Health check menggunakan `/` (root endpoint) bukan `/api/`
3. Cek logs:
```bash
docker compose logs
```

### Masalah: 502 Bad Gateway

**Penyebab:** Nginx tidak bisa menghubungi uvicorn

**Solusi:**
1. Cek uvicorn berjalan:
```bash
docker compose exec app ps aux
```
2. Cek port 8000 tidak digunakan aplikasi lain

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
Buat file `.env` di folder `backend/`:
```env
APP_NAME=IT Asset Management API
APP_ENV=development
DATABASE_URL=sqlite:///data/it_asset.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

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

## Peran Tim

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