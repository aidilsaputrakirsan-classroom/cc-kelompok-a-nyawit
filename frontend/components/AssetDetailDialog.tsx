import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Asset } from '@/data/mockAssets';
<<<<<<< HEAD
import { Package, MapPin, User, Calendar, Activity, Tag, Hash, Barcode, Cpu } from 'lucide-react';
=======
import { Package, MapPin, User, Calendar, Activity, Tag } from 'lucide-react';
>>>>>>> ff544d2faa163bbeac3612ad527cd6e7a82de964

interface AssetDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export function AssetDetailDialog({ open, onOpenChange, asset }: AssetDetailDialogProps) {
  if (!asset) return null;

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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return '#10B981';
      case 'Good':
        return '#2563EB';
      case 'Fair':
        return '#F59E0B';
      case 'Poor':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <DialogTitle className="text-lg md:text-2xl font-bold truncate" style={{ color: '#111827' }}>
              {asset.name}
            </DialogTitle>
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
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Asset ID: {asset.id}
          </p>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 mt-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#111827' }}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Type</p>
                    <p className="text-base" style={{ color: '#111827' }}>{asset.type}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Category</p>
                    <p className="text-base" style={{ color: '#111827' }}>{asset.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Serial Number</p>
                    <p className="text-base font-mono" style={{ color: '#111827' }}>{asset.serialNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Barcode className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Product Number</p>
                    <p className="text-base font-mono" style={{ color: '#111827' }}>{asset.productNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Cpu className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Model Number</p>
                    <p className="text-base" style={{ color: '#111827' }}>{asset.modelNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Location</p>
                    <p className="text-base" style={{ color: '#111827' }}>{asset.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Assigned To</p>
                    <p className="text-base" style={{ color: '#111827' }}>{asset.assignedTo}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#111827' }}>
                Asset Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Condition</p>
                    <Badge 
                      variant="outline"
                      className="mt-1"
                      style={{ 
                        borderColor: getConditionColor(asset.condition),
                        color: getConditionColor(asset.condition),
                        backgroundColor: `${getConditionColor(asset.condition)}15`
                      }}
                    >
                      {asset.condition}
                    </Badge>
                  </div>
                </div>

<<<<<<< HEAD


=======
>>>>>>> ff544d2faa163bbeac3612ad527cd6e7a82de964
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Purchase Date</p>
                    <p className="text-base" style={{ color: '#111827' }}>
                      {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Last Updated</p>
                    <p className="text-base" style={{ color: '#111827' }}>
                      {asset.lastUpdate ? new Date(asset.lastUpdate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
