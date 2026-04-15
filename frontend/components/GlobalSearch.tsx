import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockAssets, Asset } from '@/data/mockAssets';
import { Badge } from '@/components/ui/badge';
import { AssetDetailDialog } from './AssetDetailDialog';

export function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredAssets = searchQuery.trim() 
    ? mockAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.assignedTo || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Use':
        return '#10B981';
      case 'Available':
        return '#2563EB';
      case 'Under Maintenance':
        return '#F59E0B';
      case 'Retired':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="relative w-full md:max-w-sm" ref={wrapperRef}>
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" 
        style={{ color: '#9CA3AF' }} 
      />
      <Input
        type="text"
        placeholder="Search assets..."
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => searchQuery && setIsOpen(true)}
        className="pl-10 pr-4 py-2 w-full border focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          borderRadius: '8px',
          height: '36px'
        }}
      />
      
      {isOpen && searchQuery && (
        <div 
          className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg overflow-hidden z-50"
          style={{ 
            borderColor: '#E5E7EB',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {filteredAssets.length > 0 ? (
            <div>
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  style={{ borderColor: '#F3F4F6' }}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setDialogOpen(true);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm" style={{ color: '#111827' }}>
                          {asset.name}
                        </span>
                        <span className="text-xs" style={{ color: '#6B7280' }}>
                          {asset.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                        <span>{asset.type}</span>
                        <span>•</span>
                        <span>{asset.location}</span>
                        <span>•</span>
                        <span>{asset.assignedTo}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className="shrink-0"
                      style={{ 
                        borderColor: getStatusColor(asset.status),
                        color: getStatusColor(asset.status),
                        backgroundColor: `${getStatusColor(asset.status)}15`
                      }}
                    >
                      {asset.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm" style={{ color: '#6B7280' }}>
              No assets found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
      
      <AssetDetailDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        asset={selectedAsset} 
      />
    </div>
  );
}


