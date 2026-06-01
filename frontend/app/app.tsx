'use client';

import { useState, useEffect } from 'react';
import { LoginPage } from '@/pages/LoginPage';
import { LeftNavigation, PageType } from '@/components/LeftNavigation';
import { MobileNavigation } from '@/components/MobileNavigation';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssetManagementPage } from '@/pages/AssetManagementPage';
import { LocationManagementPage } from '@/pages/LocationManagementPage';
import { ConditionManagementPage } from '@/pages/ConditionManagementPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { TransactionManagementPage } from '@/pages/TransactionManagementPage';
import { LayoutDashboard, ShieldAlert } from 'lucide-react';
import { AuthService } from '@/lib/auth.ts';

// ─── Aturan akses terpusat ────────────────────────────────────────────────────
// Tambahkan halaman baru di sini untuk mengatur siapa yang boleh mengaksesnya.
const PAGE_ACCESS: Record<PageType, { requiresAuth: boolean; allowedRoles: string[] | null }> = {
  'inventory':              { requiresAuth: true, allowedRoles: null },          // null = semua role
  'asset-management':      { requiresAuth: true, allowedRoles: null },
  'location-management':   { requiresAuth: true, allowedRoles: null },
  'condition-management':  { requiresAuth: true, allowedRoles: null },
  'transaction-management':{ requiresAuth: true, allowedRoles: null },
  'user-management':       { requiresAuth: true, allowedRoles: ['admin'] },      // hanya admin
};

/** Sumber kebenaran tunggal untuk pengecekan akses halaman */
function canAccessPage(page: PageType, userRole: string): boolean {
  const rule = PAGE_ACCESS[page];
  if (!rule) return false;
  if (rule.allowedRoles === null) return true;          // semua role diizinkan
  return rule.allowedRoles.includes(userRole);
}
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // cegah flash sebelum sesi dicek
  const [currentPage, setCurrentPage] = useState<PageType>('inventory');
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    // Cek sesi yang tersimpan saat aplikasi pertama kali dimuat
    const isAuthenticated = AuthService.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(true);
      const currentUser = AuthService.getCurrentUser();
      setUserRole(currentUser?.role || 'user');
    }
    setIsInitializing(false); // selesai inisialisasi, baru render UI
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentPage('inventory');
    setUserRole('user');
  };

  const handlePageChange = (page: PageType) => {
    // Gunakan fungsi terpusat canAccessPage sebagai sumber kebenaran
    if (!canAccessPage(page, userRole)) {
      return; // diam-diam tolak navigasi ke halaman yang tidak diizinkan
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    // ── Lapisan pertahanan kedua (defense-in-depth) ──────────────────────────
    // Meskipun handlePageChange sudah memblokir navigasi, guard ini memastikan
    // halaman terlarang TIDAK PERNAH dirender bahkan jika state dimanipulasi.
    if (!canAccessPage(currentPage, userRole)) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <ShieldAlert className="h-16 w-16" style={{ color: '#EF4444' }} />
          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color: '#111827' }}>Akses Ditolak</p>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </div>
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    switch (currentPage) {
      case 'inventory':
        return <DashboardPage />;
      case 'asset-management':
        return <AssetManagementPage />;
      case 'location-management':
        return <LocationManagementPage />;
      case 'condition-management':
        return <ConditionManagementPage />;
      case 'user-management':
        return <UserManagementPage userRole={userRole} />;
      case 'transaction-management':
        return <TransactionManagementPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Tampilkan layar kosong selama sesi sedang dicek untuk mencegah flash
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#6B7280' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => {
      setIsLoggedIn(true);
      const currentUser = AuthService.getCurrentUser();
      setUserRole(currentUser?.role || 'user');
    }} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <LeftNavigation currentPage={currentPage} onPageChange={handlePageChange} userRole={userRole} />

      <div className="md:ml-56">
        <header className="border-b bg-white fixed top-0 right-0 md:left-56 left-0 z-50" style={{ height: '73px' }}>
          <div className="px-3 md:px-6 h-full flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <MobileNavigation currentPage={currentPage} onPageChange={handlePageChange} userRole={userRole} />

              <div className="md:hidden flex items-center gap-2">
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                  <LayoutDashboard className="h-4 w-4" style={{ color: '#2563EB' }} />
                </div>
                <h1 className="text-sm font-bold whitespace-nowrap" style={{ color: '#111827' }}>Asset Manager</h1>
              </div>


            </div>

            <UserProfileDropdown onLogout={handleLogout} />
          </div>
        </header>

        <main className="p-3 md:p-6" style={{ paddingTop: '85px' }}>

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
