import { AuthService } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';

interface UserProfileDropdownProps {
  onLogout?: () => void;
}

export function UserProfileDropdown({ onLogout }: UserProfileDropdownProps) {
  const user = AuthService.getCurrentUser();

  const displayName = user?.full_name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const role = user?.role || 'Member';

  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg transition-colors hover:bg-gray-100 min-h-[44px]">
          <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
            <AvatarFallback style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: '600' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium" style={{ color: '#111827' }}>{displayName}</p>
            <p className="text-xs capitalize" style={{ color: '#6B7280' }}>{role}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium" style={{ color: '#111827' }}>{displayName}</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" style={{ color: '#EF4444' }} onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
