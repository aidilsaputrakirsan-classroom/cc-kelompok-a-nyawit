import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LocationAPI, Location } from '@/lib/api';
import type { Asset, AssetStatus, AssetCondition, AssetCategory } from '@/data/mockAssets';

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSave: (asset: Asset, locationId?: number) => void;
}

const statuses: AssetStatus[] = ['In Use', 'Available', 'Under Maintenance', 'Retired'];
const conditions: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];
const categories: AssetCategory[] = ['Hardware', 'Software', 'Peripherals'];
const assetTypes: Record<AssetCategory, string[]> = {
  Hardware: ['Laptop', 'Desktop', 'Server', 'Tablet', 'Smartphone'],
  Software: ['Software License', 'OS License', 'Cloud Subscription', 'Antivirus License', 'Design Suite'],
  Peripherals: ['Monitor', 'Keyboard', 'Mouse', 'Printer', 'Webcam', 'Headset', 'Docking Station']
};

export function AssetDialog({ open, onOpenChange, asset, onSave }: AssetDialogProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    type: '',
    category: 'Hardware',
    location: '',
    status: 'Available',
    assignedTo: 'Unassigned',
    condition: 'Good',
    purchaseDate: new Date().toISOString().split('T')[0],
    lastUpdate: new Date().toISOString().split('T')[0]
  });

  // Fetch locations from database when dialog opens
  useEffect(() => {
    const fetchLocations = async () => {
      if (!open) return;
      setIsLoadingLocations(true);
      try {
        const data = await LocationAPI.getAll();
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, [open]);

  // Initialize form data when dialog opens or asset changes
  useEffect(() => {
    if (!open) return;

    if (asset) {
      // Editing existing asset - use asset data
      setFormData(asset);
    } else {
      // Adding new asset - reset form with empty/default values
      setFormData({
        name: '',
        type: '',
        category: 'Hardware',
        location: '',
        status: 'Available',
        assignedTo: 'Unassigned',
        condition: 'Good',
        purchaseDate: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0]
      });
    }
  }, [asset, open]);

  // Set default location after locations are loaded (only for new assets)
  useEffect(() => {
    if (!open || asset) return; // Only for new assets
    if (locations.length > 0 && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: locations[0].name
      }));
    }
  }, [locations, open, asset, formData.location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLocation = locations.find(loc => loc.name === formData.location);
    const assetData: any = {
      ...formData,
      id: asset?.id || '',
      asset_code: asset?.asset_code || `${formData.category?.substring(0, 3).toUpperCase()}-${Date.now()}`,
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    onSave(assetData, selectedLocation?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">{asset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as AssetCategory, type: '' })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes[formData.category || 'Hardware'].map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                disabled={isLoadingLocations || locations.length === 0}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : locations.length === 0 ? "No locations available" : "Select location"} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as AssetStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value as AssetCondition })}
              >
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
              {asset ? 'Save Changes' : 'Add Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
