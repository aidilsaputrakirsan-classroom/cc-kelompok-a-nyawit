import { Card } from '@/components/ui/card';
import { Package, Laptop, FileCode, Cable } from 'lucide-react';
import type { AssetCategory } from '@/data/mockAssets';

interface SidebarProps {
  selectedCategory: AssetCategory | 'All';
  onCategoryChange: (category: AssetCategory | 'All') => void;
  categoryCounts: Record<string, number>;
}

const categories = [
  { id: 'All', label: 'All Assets', icon: Package },
  { id: 'Hardware', label: 'Hardware', icon: Laptop },
  { id: 'Software', label: 'Software', icon: FileCode },
  { id: 'Peripherals', label: 'Peripherals', icon: Cable }
];

export function Sidebar({ selectedCategory, onCategoryChange, categoryCounts }: SidebarProps) {
  return (
    <Card className="h-fit">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Categories</h2>
        <nav className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            const count = categoryCounts[category.id] || 0;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id as AssetCategory | 'All')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={isActive ? {
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF'
                } : {
                  backgroundColor: 'transparent',
                  color: '#111827'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </div>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={isActive ? {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF'
                  } : {
                    backgroundColor: '#E5E7EB',
                    color: '#6B7280'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
}
