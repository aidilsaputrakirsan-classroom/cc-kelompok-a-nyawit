import { Menu, LayoutDashboard, ClipboardList, MapPin, Tag, Users, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { PageType } from '@/components/LeftNavigation';

interface MobileNavigationProps {
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

export function MobileNavigation({ currentPage, onPageChange, userRole }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const isAdmin = userRole === 'admin';
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handlePageChange = (page: PageType) => {
    onPageChange(page);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-4 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
              <LayoutDashboard className="h-5 w-5" style={{ color: '#2563EB' }} />
            </div>
            <SheetTitle className="text-base font-bold" style={{ color: '#111827' }}>
              Asset Manager
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="p-3">
          <nav className="space-y-0.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id as PageType)}
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
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
