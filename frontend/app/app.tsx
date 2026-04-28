'use client';

import { useState, useEffect } from 'react';
import { LoginPage } from '@/pages/LoginPage';
import { LeftNavigation, PageType } from '@/components/LeftNavigation';
import { MobileNavigation } from '@/components/MobileNavigation';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssetManagementPage } from '@/pages/AssetManagementPage';
import { LocationManagementPage } from '@/pages/LocationManagementPage';
import { ConditionManagementPage } from '@/pages/ConditionManagementPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
<<<<<<< HEAD
import { TransaksiPage } from '@/pages/TransaksiPage';
import { ConsumablesPage } from '@/pages/ConsumablesPage';
=======
import { TransactionManagementPage } from '@/pages/TransactionManagementPage';
>>>>>>> ff544d2faa163bbeac3612ad527cd6e7a82de964
import { LayoutDashboard } from 'lucide-react';
import { AuthService } from '@/lib/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('inventory');

  useEffect(() => {
    const isAuthenticated = AuthService.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentPage('inventory');
  };

  const renderPage = () => {
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
        return <UserManagementPage />;
<<<<<<< HEAD
      case 'transaksi':
        return <TransaksiPage />;
      case 'consumables':
        return <ConsumablesPage />;

=======
      case 'transaction-management':
        return <TransactionManagementPage />;
>>>>>>> ff544d2faa163bbeac3612ad527cd6e7a82de964
      default:
        return <DashboardPage />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <LeftNavigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="md:ml-56">
        <header className="border-b bg-white fixed top-0 right-0 md:left-56 left-0 z-50" style={{ height: '73px' }}>
          <div className="px-3 md:px-6 h-full flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <MobileNavigation currentPage={currentPage} onPageChange={setCurrentPage} />

              <div className="md:hidden flex items-center gap-2">
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                  <LayoutDashboard className="h-4 w-4" style={{ color: '#2563EB' }} />
                </div>
                <h1 className="text-sm font-bold whitespace-nowrap" style={{ color: '#111827' }}>Asset Manager</h1>
              </div>

              <div className="hidden md:block flex-1 min-w-0">
                <GlobalSearch />
              </div>
            </div>

            <UserProfileDropdown onLogout={handleLogout} />
          </div>
        </header>

        <main className="p-3 md:p-6" style={{ paddingTop: '85px' }}>
          <div className="md:hidden mb-4">
            <GlobalSearch />
          </div>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
