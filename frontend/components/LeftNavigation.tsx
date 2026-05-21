import { LayoutDashboard, ClipboardList, MapPin, Tag, Users, ArrowRightLeft } from 'lucide-react';

export type PageType = 'inventory' | 'asset-management' | 'location-management' | 'condition-management' | 'user-management' | 'transaction-management';

interface LeftNavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  userRole?: string;
}

const navItems = [
  { id: 'inventory', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { id: 'asset-management', label: 'Manajemen Aset', icon: ClipboardList, adminOnly: false },
  { id: 'location-management', label: 'Manajemen Lokasi', icon: MapPin, adminOnly: false },
  { id: 'condition-management', label: 'Manajemen Kondisi', icon: Tag, adminOnly: false },
  { id: 'user-management', label: 'Manajemen Pengguna', icon: Users, adminOnly: true },
  { id: 'transaction-management', label: 'Manajemen Transaksi', icon: ArrowRightLeft, adminOnly: false },
];

export function LeftNavigation({ currentPage, onPageChange, userRole }: LeftNavigationProps) {
  const isAdmin = userRole === 'admin';
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);
  return (
    <nav className="hidden md:flex w-56 h-screen border-r bg-white fixed left-0 top-0 flex-col">
      <div className="px-4 py-5 border-b flex items-center" style={{ height: '73px' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <LayoutDashboard className="h-5 w-5" style={{ color: '#2563EB' }} />
          </div>
          <h1 className="text-base font-bold whitespace-nowrap" style={{ color: '#111827' }}>Asset Manager</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as PageType)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={isActive ? {
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  borderLeft: '3px solid #2563EB',
                  paddingLeft: 'calc(0.75rem - 3px)'
                } : {
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  borderLeft: '3px solid transparent',
                  paddingLeft: 'calc(0.75rem - 3px)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
