import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Asset, AssetStatus, AssetCondition, AssetCategory } from '@/data/mockAssets';

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSave: (asset: Asset) => void;
}

const locations = ['Rak A', 'Rak B', 'Rak C', 'Rak D', 'Rak E', 'Rak F', 'Lantai', 'Lemari kaca'];
const statuses: AssetStatus[] = ['In Use', 'Available','Retired'];
const conditions: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];
const categories: AssetCategory[] = ['Hardware', 'Peripherals'];
const assetTypes: Record<'Hardware' | 'Peripherals', string[]> = {
  Hardware: ['Laptop', 'Desktop', 'Server', 'Tablet', 'Smartphone'],
  Peripherals: ['Monitor', 'Keyboard', 'Mouse', 'Printer', 'Webcam', 'Headset', 'Docking Station']
};

const createDefaultFormData = (): Partial<Asset> => {
  const timestamp = Date.now().toString();
  const suffix = timestamp.slice(-5);
  const yearSegment = new Date().getFullYear();
  return {
    name: '',
    type: '',
    category: 'Hardware',
    location: locations[0],
    status: 'Available',
    assignedTo: 'Unassigned',
    condition: 'Good',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    lastUpdate: new Date().toISOString().split('T')[0],
    serialNumber: `SN-AUTO-${suffix}`,
    productNumber: `PN-AUTO-${suffix}`,
    modelNumber: `MD-${yearSegment}-${suffix}`,
  };
};

export function AssetDialog({ open, onOpenChange, asset, onSave }: AssetDialogProps) {
  const [formData, setFormData] = useState<Partial<Asset>>(createDefaultFormData());

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    } else {
      setFormData(createDefaultFormData());
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assetData: Asset = {
      id: asset?.id || `${formData.category?.substring(0, 3).toUpperCase()}-${Date.now()}`,
      name: formData.name!,
      type: formData.type!,
      category: formData.category!,
      location: formData.location!,
      status: formData.status!,
      assignedTo: formData.assignedTo!,
      serialNumber: formData.serialNumber || `SN-AUTO-${Date.now().toString().slice(-5)}`,
      productNumber: formData.productNumber || `PN-AUTO-${Date.now().toString().slice(-5)}`,
      modelNumber: formData.modelNumber || `MD-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      purchaseDate: formData.purchaseDate!,
      lastUpdate: new Date().toISOString().split('T')[0],
      condition: formData.condition!,
      quantity: formData.quantity ?? 1,
    };
    onSave(assetData);
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
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
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
                  {(assetTypes[formData.category as 'Hardware' | 'Peripherals'] ?? assetTypes['Hardware']).map((type: string) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productNumber">Product Number</Label>
              <Input
                id="productNumber"
                value={formData.productNumber}
                onChange={(e) => setFormData({ ...formData, productNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                required
              />
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
