# IT Asset Management System (Sistem Manajemen Aset IT)

## Deskripsi Proyek
Sistem Manajemen Aset IT adalah platform khusus yang dirancang untuk mengelola dan mendata seluruh infrastruktur perangkat keras perusahaan. Berbeda dengan sistem inventaris umum, aplikasi ini difokuskan pada kebutuhan spesifik departemen IT, mulai dari pengelolaan perangkat di *data center* hingga perangkat *endpoint* yang digunakan oleh karyawan.

Sistem ini membantu administrator IT dalam menjaga transparansi distribusi aset, memantau kesehatan perangkat, serta memastikan efisiensi dalam perencanaan kapasitas jaringan dan server.

## Tech Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Package Manager:** Bun
- **Icons:** Lucide React

## Instalasi Frontend

### Prerequisites
Pastikan Anda sudah menginstall:
- **Bun** (package manager) - [Download Bun](https://bun.sh)
- **Git** - untuk clone repository

### Install Bun (Windows)
Jika Bun belum terinstall, jalankan perintah berikut di PowerShell:
```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

Setelah instalasi selesai, restart terminal Anda.

### Langkah-langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-nyawit.git
   cd cc-kelompok-a-nyawit
   ```

2. **Checkout ke Branch Putu**
   ```bash
   git checkout Putu
   ```

3. **Install Dependencies**
   ```bash
   bun install
   ```

4. **Jalankan Development Server**
   ```bash
   bun dev
   ```

   Aplikasi akan berjalan di: **http://localhost:5173/**

### Perintah Tersedia

| Perintah | Deskripsi |
|----------|-----------|
| `bun dev` | Menjalankan development server |
| `bun build` | Build aplikasi untuk production |
| `bun preview` | Preview production build secara lokal |
| `bun lint` | Menjalankan ESLint untuk code quality |

### Struktur Folder

```
cc-kelompok-a-nyawit/
├── app/                    # Main application entry
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── AssetTable.tsx     # Asset management table
│   ├── MetricCards.tsx    # Dashboard metrics
│   └── ...
├── pages/                  # Page components
│   ├── InventoryPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── data/                   # Mock data & types
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── src/                    # Entry point
    ├── main.tsx           # React app initialization
    └── index.css          # Global styles
```

### Troubleshooting

**Masalah: `bun: command not found`**
- Pastikan Bun sudah terinstall dengan benar
- Restart terminal Anda setelah instalasi Bun
- Cek PATH environment variable

**Masalah: Port 5173 sudah digunakan**
- Ubah port di `vite.config.ts` atau
- Hentikan aplikasi lain yang menggunakan port tersebut

## Fitur Utama

### 1. Manajemen Data Barang (Asset Inventory)
Fitur inti untuk mendata setiap perangkat keras dengan detail teknis yang mendalam.
- **Detail Teknis:** Mencatat Serial Number, Brand, Model, Spesifikasi (RAM, CPU, IP Address), dan Tanggal Pembelian.
- **Identifikasi Unik:** Setiap aset diberikan ID unik untuk memudahkan pelacakan fisik.

### 2. Kategorisasi Aset
Mengelompokkan perangkat untuk mempermudah manajemen dan pelaporan:
- **Network Devices:** Router (untuk failover ISP), Switch (seri Cisco Nexus, Catalyst, dll), Access Point, dan Firewall.
- **Server Infrastructure:** Physical Servers, Storage Arrays, dan UPS.
- **Endpoint:** Laptop/Macbook karyawan, Monitor, dan perangkat periferal lainnya.
- **Cabling & Accessories:** Manajemen stok kabel (Fiber Optic, UTP) dan transceiver.

### 3. Pemetaan Lokasi Fisik (Rack & Location Management)
Fitur untuk melacak di mana perangkat berada secara fisik.
- **Lokasi Rak:** Penentuan nomor rak (U-position) di dalam *data center*.
- **Lokasi Kantor:** Cabang, ruang kerja, atau gudang penyimpanan.

### 4. Pelacakan Status Barang
Memantau siklus hidup aset secara *real-time*:
- **Tersedia (Available):** Barang siap digunakan atau dipinjam.
- **Dipinjam (In Use/Borrowed):** Perangkat sedang digunakan oleh karyawan atau terpasang di jaringan aktif.
- **Rusak (Maintenance/Broken):** Perangkat dalam perbaikan atau perlu diganti.
- **Decommissioned:** Perangkat yang sudah tidak layak pakai dan ditarik dari peredaran.

### 5. Log Peminjaman & Riwayat
Mencatat riwayat penggunaan aset, terutama untuk perangkat *endpoint* (laptop), sehingga administrator tahu siapa yang menggunakan barang tersebut dan sejak kapan.

### 6. Sistem Autentikasi JWT (Baru!)
Sistem dilengkapi dengan autentikasi berbasis token JWT untuk keamanan:
- **Role-based Access Control (RBAC):** Tiga level pengguna - Admin, Manager, dan User
- **Token-based Authentication:** Login dengan JWT token yang aman
- **Protected Endpoints:** Semua endpoint API dilindungi dengan autentikasi
- **Default Admin:** Pengguna pertama yang mendaftar otomatis menjadi admin

## Target Pengguna
- **IT Infrastructure Engineer/Sysadmin:** Untuk memantau perangkat jaringan dan server.
- **IT Support/Procurement:** Untuk manajemen stok laptop dan aset kantor.
- **IT Manager:** Untuk pelaporan aset perusahaan secara berkala.

---
*Proyek ini merupakan bagian dari tugas Cloud Computing Kelompok A Nyawit.*

## Backend API (FastAPI + PostgreSQL + JWT Auth)

Struktur backend tersedia di folder `backend/` dengan stack:
- `FastAPI` untuk REST API
- `SQLAlchemy` untuk ORM
- `PostgreSQL` sebagai database utama
- `JWT` untuk autentikasi
- `Passlib` untuk hashing password

### Fitur Backend yang Disediakan
- **Autentikasi:**
  - Register user (`/api/v1/auth/register`)
  - Login dengan JWT (`/api/v1/auth/login`)
  - Get current user (`/api/v1/auth/me`)
- **Manajemen User (Admin only):**
  - CRUD users (`/api/v1/users`)
  - Role management (admin, manager, user)
- **Kategori:** CRUD kategori aset (`/api/v1/categories`)
- **Aset:** CRUD aset IT (`/api/v1/assets`)
- **Log Peminjaman:** Log peminjaman dan pengembalian aset (`/api/v1/borrow-logs`)
- **Health Check:** (`/api/v1/health`)

### Role & Permissions

| Endpoint | Admin | Manager | User |
|----------|-------|---------|------|
| GET /categories | ✅ | ✅ | ✅ |
| POST /categories | ✅ | ✅ | ❌ |
| PUT/DELETE /categories | ✅ | ✅ | ❌ |
| GET /assets | ✅ | ✅ | ✅ |
| POST/PUT/DELETE /assets | ✅ | ✅ | ❌ |
| GET /borrow-logs | ✅ | ✅ | ✅ |
| POST /borrow-logs | ✅ | ✅ | ❌ |
| GET /users | ✅ | ✅ | ❌ |
| POST/PUT/DELETE /users | ✅ | ❌ | ❌ |

### Struktur Folder
```text
backend/
  app/
    api/
      deps.py          # Authentication dependencies
      router.py        # Main API router
      routes/
        auth.py        # Authentication endpoints
        users.py       # User management
        assets.py      # Asset CRUD
        categories.py  # Category CRUD
        borrow_logs.py # Borrow log CRUD
        health.py      # Health check
    core/
      config.py        # App configuration
      security.py      # JWT & password hashing
    db/
      database.py      # Database connection
      init_db.py       # Database initialization
    models/
      asset.py         # Asset model
      base.py          # SQLAlchemy base
      borrow_log.py    # Borrow log model
      category.py      # Category model
      user.py          # User model
    schemas/
      asset.py         # Asset schemas
      borrow_log.py    # Borrow log schemas
      category.py      # Category schemas
      user.py          # User schemas
    main.py            # FastAPI app entry point
  database/
    schema.sql         # Database schema
  tests/
    test_health.py     # Health check tests
    test_auth.py       # Auth tests
    test_users.py      # User management tests
  requirements.txt
  .env.example
  Dockerfile
  docker-compose.yml
```

### Menjalankan Full Stack dengan Docker Compose (Recommended)

1. Jalankan service API + PostgreSQL + pgAdmin:

```bat
cd backend
docker compose up -d --build
```

2. Cek service berjalan:

```bat
docker compose ps
```

3. Buka URL service:

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- DB GUI (pgAdmin): `http://127.0.0.1:5050`

4. Login pgAdmin:

- Email: `admin@local.dev`
- Password: `admin123`

5. Tambah server PostgreSQL di pgAdmin dengan parameter:

- Name: `it-asset-db`
- Host: `postgres`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `it_asset_db`

6. Default Admin User:

Setelah container berjalan, sistem otomatis membuat admin user:
- Username: `admin`
- Password: `admin123`

**IMPORTANT:** Ganti password default setelah login pertama!

7. Stop semua container:

```bat
docker compose down
```

Jika ingin sekaligus hapus volume data:

```bat
docker compose down -v
```

### API Authentication Flow

1. **Register First User (becomes Admin):**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "admin123",
    "full_name": "System Administrator"
  }'
```

2. **Login:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

3. **Use Token in Requests:**
```bash
curl -X GET "http://localhost:8000/api/v1/assets" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Setup Menjalankan Backend (Tanpa Docker)

1. Buat virtual environment lalu install dependency:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Siapkan database PostgreSQL:

- Buat database bernama `it_asset_db`
- Copy `.env.example` ke `.env` dan sesuaikan konfigurasi

3. Jalankan API:

```bash
uvicorn app.main:app --reload
```

4. Dokumentasi API:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### Environment Variables

Buat file `.env` di folder `backend/`:

```env
APP_NAME=IT Asset Management API
APP_ENV=development
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/it_asset_db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Note:** Untuk production, pastikan untuk mengubah `SECRET_KEY` dengan nilai yang aman dan random!
