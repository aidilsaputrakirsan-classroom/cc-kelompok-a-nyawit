import { LayoutDashboard, Package, FileText, BarChart3, Settings } from 'lucide-react';

export type PageType = 'inventory' | 'reports' | 'analytics' | 'settings';

interface LeftNavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const navItems = [
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function LeftNavigation({ currentPage, onPageChange }: LeftNavigationProps) {
  return (
    <nav className="hidden md:flex w-52 h-screen border-r bg-white fixed left-0 top-0 flex-col">
      <div className="px-4 py-5 border-b flex items-center" style={{ height: '73px' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <LayoutDashboard className="h-5 w-5" style={{ color: '#2563EB' }} />
          </div>
          <h1 className="text-base font-bold whitespace-nowrap" style={{ color: '#111827' }}>Asset Manager</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as PageType)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={isActive ? {
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  borderLeft: '3px solid #2563EB',
                  paddingLeft: 'calc(1rem - 3px)'
                } : {
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  borderLeft: '3px solid transparent',
                  paddingLeft: 'calc(1rem - 3px)'
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
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>


    </nav>
  );
}
