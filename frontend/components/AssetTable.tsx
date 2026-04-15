import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, ChevronUp, ChevronDown, Plus, Pencil, Check, X } from 'lucide-react';
import { AssetDialog } from '@/components/AssetDialog';
import { useToast } from '@/hooks/use-toast';
import { LocationAPI, Location } from '@/lib/api';
import type { Asset, AssetStatus, AssetCondition } from '@/data/mockAssets';

interface AssetTableProps {
  assets: Asset[];
  onAssetsChange?: (asset: Asset, locationId?: number) => void;
  onEditAsset?: (asset: Asset, locationId?: number) => void;
}

type SortField = 'id' | 'name' | 'type' | 'location' | 'status' | 'assignedTo' | 'condition' | 'lastUpdate';
type SortDirection = 'asc' | 'desc';

const STATUS_STYLES: Record<AssetStatus, { bg: string; text: string }> = {
  'In Use': { bg: '#ECFDF5', text: '#10B981' },
  'Available': { bg: '#EFF6FF', text: '#2563EB' },
  'Under Maintenance': { bg: '#FEF3C7', text: '#F59E0B' },
  'Retired': { bg: '#F3F4F6', text: '#6B7280' }
};

const CONDITION_STYLES: Record<AssetCondition, { bg: string; text: string }> = {
  'Excellent': { bg: '#ECFDF5', text: '#10B981' },
  'Good': { bg: '#DBEAFE', text: '#3B82F6' },
  'Fair': { bg: '#FEF3C7', text: '#F59E0B' },
  'Poor': { bg: '#FEE2E2', text: '#EF4444' }
};

const statuses: AssetStatus[] = ['In Use', 'Available', 'Under Maintenance', 'Retired'];
const conditions: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];
const assetTypes = ['Laptop', 'Desktop', 'Server', 'Tablet', 'Smartphone', 'Software License', 'OS License', 'Cloud Subscription', 'Antivirus License', 'Design Suite', 'Monitor', 'Keyboard', 'Mouse', 'Printer', 'Webcam', 'Headset', 'Docking Station'];

export function AssetTable({ assets, onAssetsChange, onEditAsset }: AssetTableProps) {
  const [localAssets, setLocalAssets] = useState(assets);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Asset | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await LocationAPI.getAll();
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, []);

  const currentAssets = onAssetsChange ? assets : localAssets;

  const availableLocations = Array.from(new Set(currentAssets.map(a => a.location))).sort();

  const filteredAssets = currentAssets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue: string | number = a[sortField as keyof Asset] as string | number;
    let bValue: string | number = b[sortField as keyof Asset] as string | number;
    
    if (sortField === 'lastUpdate') {
      aValue = new Date(a.lastUpdate || '').getTime();
      bValue = new Date(b.lastUpdate || '').getTime();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedAssets.length / pageSize);
  const paginatedAssets = sortedAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSaveAsset = (asset: Asset, locationId?: number) => {
    if (onAssetsChange) {
      onAssetsChange(asset, locationId);
    } else {
      setLocalAssets([asset, ...localAssets]);
    }
    
    toast({
      title: 'Asset added successfully',
      description: `${asset.name} has been added to the inventory.`,
    });
    
    setSelectedAsset(null);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setSelectedAsset(null);
    setDialogOpen(true);
  };

  const handleEditRow = (asset: Asset) => {
    setEditingRowId(asset.id);
    setEditFormData({ ...asset });
  };

  const handleSaveRow = () => {
    if (!editFormData) return;
    
    const selectedLocation = locations.find(loc => loc.name === editFormData.location);
    const updatedAsset = { ...editFormData, lastUpdate: new Date().toISOString().split('T')[0] };
    
    if (onEditAsset) {
      onEditAsset(updatedAsset, selectedLocation?.id);
    } else {
      setLocalAssets(currentAssets.map((a) => a.id === updatedAsset.id ? updatedAsset : a));
    }
    
    setEditingRowId(null);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span style={{ color: '#111827' }}>IT Assets</span>
            <Button size="sm" onClick={handleAdd} className="w-full sm:w-auto sm:min-w-[110px]" style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-3">
          <div className="space-y-2 md:space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#6B7280' }} />
                <Input
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={(value) => {
                setLocationFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {availableLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md overflow-hidden relative -mx-3 md:mx-0">
              <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <button
                        type="button"
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Asset ID <SortIcon field="id" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[140px]">
                      <button
                        type="button"
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Name <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <button
                        type="button"
                        onClick={() => handleSort('type')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Type <SortIcon field="type" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <button
                        type="button"
                        onClick={() => handleSort('location')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Location <SortIcon field="location" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[140px]">
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Status <SortIcon field="status" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[140px]">
                      <button
                        type="button"
                        onClick={() => handleSort('assignedTo')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Assigned To <SortIcon field="assignedTo" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[110px]">
                      <button
                        type="button"
                        onClick={() => handleSort('condition')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Condition <SortIcon field="condition" />
                      </button>
                      </TableHead>
                    <TableHead className="w-[120px]">
                      <button
                        type="button"
                        onClick={() => handleSort('lastUpdate')}
                        className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
                      >
                        Last Update <SortIcon field="lastUpdate" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[60px] sticky right-0 bg-white" style={{ boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)' }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No assets found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssets.map((asset) => {
                      const isEditing = editingRowId === asset.id;
                      const rowData = isEditing ? editFormData! : asset;

                      return (
                        <TableRow key={asset.id}>
                          <TableCell className="font-mono text-sm whitespace-nowrap">{asset.id}</TableCell>
                          <TableCell className="font-medium">
                            {isEditing ? (
                              <Input
                                value={rowData.name}
                                onChange={(e) => setEditFormData({ ...rowData, name: e.target.value })}
                                className="h-8"
                              />
                            ) : (
                              <div className="truncate max-w-[140px]" title={asset.name}>
                                {asset.name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={rowData.type}
                                onValueChange={(value) => setEditFormData({ ...rowData, type: value })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {assetTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="whitespace-nowrap">{asset.type}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={rowData.location}
                                onValueChange={(value) => setEditFormData({ ...rowData, location: value })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="truncate max-w-[150px]" title={asset.location}>
                                {asset.location}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={rowData.status}
                                onValueChange={(value) => setEditFormData({ ...rowData, status: value as AssetStatus })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{
                                  backgroundColor: STATUS_STYLES[asset.status].bg,
                                  color: STATUS_STYLES[asset.status].text
                                }}
                              >
                                {asset.status}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={rowData.assignedTo}
                                onChange={(e) => setEditFormData({ ...rowData, assignedTo: e.target.value })}
                                className="h-8"
                              />
                            ) : (
                              <div className="truncate max-w-[140px]" title={asset.assignedTo}>
                                {asset.assignedTo}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={rowData.condition}
                                onValueChange={(value) => setEditFormData({ ...rowData, condition: value as AssetCondition })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditions.map((cond) => (
                                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{
                                  backgroundColor: CONDITION_STYLES[asset.condition].bg,
                                  color: CONDITION_STYLES[asset.condition].text
                                }}
                              >
                                {asset.condition}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {asset.lastUpdate ? new Date(asset.lastUpdate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-white" style={{ boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)' }}>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleSaveRow}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" style={{ color: '#10B981' }} />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" style={{ color: '#EF4444' }} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditRow(asset)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" style={{ color: '#6B7280' }} />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm whitespace-nowrap" style={{ color: '#6B7280' }}>Rows per page:</span>
                <Select value={String(pageSize)} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-16 sm:w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs sm:text-sm whitespace-nowrap" style={{ color: '#6B7280' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-3"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-3"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={selectedAsset}
        onSave={handleSaveAsset}
      />
    </>
  );
}

