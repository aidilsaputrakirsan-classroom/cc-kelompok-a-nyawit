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
- **Visualisasi Rak:** Membantu tim teknis menemukan perangkat dengan cepat saat dibutuhkan pemeliharaan fisik.

### 4. Pelacakan Status Barang
Memantau siklus hidup aset secara *real-time*:
- **Tersedia (Available):** Barang siap digunakan atau dipinjam.
- **Dipinjam (In Use/Borrowed):** Perangkat sedang digunakan oleh karyawan atau terpasang di jaringan aktif.
- **Rusak (Maintenance/Broken):** Perangkat dalam perbaikan atau perlu diganti.
- **Decommissioned:** Perangkat yang sudah tidak layak pakai dan ditarik dari peredaran.

### 5. Log Peminjaman & Riwayat
Mencatat riwayat penggunaan aset, terutama untuk perangkat *endpoint* (laptop), sehingga administrator tahu siapa yang menggunakan barang tersebut dan sejak kapan.

## Target Pengguna
- **IT Infrastructure Engineer/Sysadmin:** Untuk memantau perangkat jaringan dan server.
- **IT Support/Procurement:** Untuk manajemen stok laptop dan aset kantor.
- **IT Manager:** Untuk pelaporan aset perusahaan secara berkala.

---
*Proyek ini merupakan bagian dari tugas Cloud Computing Kelompok A Nyawit.*


---
*Proyek ini merupakan bagian dari tugas Cloud Computing Kelompok A Nyawit.*
