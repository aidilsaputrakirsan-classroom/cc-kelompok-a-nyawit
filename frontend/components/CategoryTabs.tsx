import { Package, Laptop, FileCode, Cable } from 'lucide-react';
import type { AssetCategory } from '@/data/mockAssets';

interface CategoryTabsProps {
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

export function CategoryTabs({ selectedCategory, onCategoryChange, categoryCounts }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;
        const count = categoryCounts[category.id] || 0;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as AssetCategory | 'All')}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all min-h-[44px]"
            style={isActive ? {
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            } : {
              backgroundColor: '#FFFFFF',
              color: '#6B7280',
              border: '1px solid #E5E7EB'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.color = '#111827';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#6B7280';
              }
            }}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{category.label}</span>
            <span 
              className="text-xs px-1.5 md:px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
              style={isActive ? {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF'
              } : {
                backgroundColor: '#F3F4F6',
                color: '#6B7280'
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
