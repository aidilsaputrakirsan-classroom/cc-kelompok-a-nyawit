import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Plus, Pencil, Trash2, Printer, Search, FileDown, Layers } from 'lucide-react';
import { AssetTable } from '@/components/AssetTable';
import { mockAssets } from '@/data/mockAssets';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import type { Asset } from '@/data/mockAssets';

// ─── Asset Types Tab ───────────────────────────────────────────────────────────

interface AssetType {
  id: number;
  category: string;
  name: string;
  assetCount: number;
}

const initialAssetTypes: AssetType[] = [
  { id: 1, category: 'Hardware', name: 'Laptop', assetCount: 22 },
  { id: 2, category: 'Hardware', name: 'Desktop', assetCount: 15 },
  { id: 3, category: 'Hardware', name: 'Server', assetCount: 8 },
  { id: 4, category: 'Hardware', name: 'Tablet', assetCount: 5 },
  { id: 5, category: 'Hardware', name: 'Smartphone', assetCount: 11 },
  { id: 6, category: 'Software', name: 'Software License', assetCount: 30 },
  { id: 7, category: 'Software', name: 'OS License', assetCount: 20 },
  { id: 8, category: 'Software', name: 'Cloud Subscription', assetCount: 12 },
  { id: 9, category: 'Software', name: 'Antivirus License', assetCount: 40 },
  { id: 10, category: 'Software', name: 'Design Suite', assetCount: 6 },
  { id: 11, category: 'Peripherals', name: 'Monitor', assetCount: 25 },
  { id: 12, category: 'Peripherals', name: 'Keyboard', assetCount: 30 },
  { id: 13, category: 'Peripherals', name: 'Mouse', assetCount: 29 },
  { id: 14, category: 'Peripherals', name: 'Printer', assetCount: 7 },
  { id: 15, category: 'Peripherals', name: 'Webcam', assetCount: 14 },
  { id: 16, category: 'Peripherals', name: 'Headset', assetCount: 18 },
  { id: 17, category: 'Peripherals', name: 'Docking Station', assetCount: 10 },
];

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  Hardware: { color: '#2563EB', bg: '#EFF6FF' },
  Software: { color: '#10B981', bg: '#ECFDF5' },
  Peripherals: { color: '#F59E0B', bg: '#FEF3C7' },
};

function AssetTypesTab() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(initialAssetTypes);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Hardware' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  const filtered = assetTypes.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setFormData({ name: '', category: 'Hardware' });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (type: AssetType) => {
    setSelectedType(type);
    setFormData({ name: type.name, category: type.category });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (isEditing && selectedType) {
      setAssetTypes(assetTypes.map(t => t.id === selectedType.id ? { ...t, name: formData.name, category: formData.category } : t));
      toast({ title: 'Jenis aset diperbarui', description: `${formData.name} berhasil diperbarui.` });
    } else {
      setAssetTypes([...assetTypes, { id: Date.now(), ...formData, assetCount: 0 }]);
      toast({ title: 'Jenis aset ditambahkan', description: `${formData.name} berhasil ditambahkan.` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    const type = assetTypes.find(t => t.id === id);
    setAssetTypes(assetTypes.filter(t => t.id !== id));
    setDeleteConfirmId(null);
    toast({ title: 'Jenis aset dihapus', description: `${type?.name} berhasil dihapus.` });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2" style={{ color: '#111827' }}>
              <Layers className="h-5 w-5" style={{ color: '#2563EB' }} />
              <span>Daftar Jenis Aset</span>
            </div>
            <Button size="sm" onClick={openAdd} style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#6B7280' }} />
              <Input placeholder="Cari jenis aset..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Peripherals">Peripherals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jenis</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center w-[100px]">Jumlah Aset</TableHead>
                  <TableHead className="w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8" style={{ color: '#6B7280' }}>
                      Tidak ada jenis aset ditemukan
                    </TableCell>
                  </TableRow>
                ) : filtered.map(type => {
                  const catStyle = CATEGORY_STYLES[type.category] || { color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium" style={{ color: '#111827' }}>{type.name}</TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
                        >
                          {type.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold" style={{ color: '#111827' }}>{type.assetCount}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(type)}>
                            <Pencil className="h-4 w-4" style={{ color: '#6B7280' }} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeleteConfirmId(type.id)}>
                            <Trash2 className="h-4 w-4" style={{ color: '#EF4444' }} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Jenis Aset' : 'Tambah Jenis Aset Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Jenis <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input placeholder="Contoh: Laptop Gaming" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Peripherals">Peripherals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()} style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
              {isEditing ? 'Simpan' : 'Tambahkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle style={{ color: '#EF4444' }}>Hapus Jenis Aset?</DialogTitle></DialogHeader>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Jenis <strong style={{ color: '#111827' }}>{assetTypes.find(t => t.id === deleteConfirmId)?.name}</strong> akan dihapus permanen.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
            <Button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Print Report Tab ───────────────────────────────────────────────────────────

function PrintReportTab() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewData, setPreviewData] = useState<Asset[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    let results = [...mockAssets];

    if (dateFrom) results = results.filter(a => a.purchaseDate >= dateFrom);
    if (dateTo) results = results.filter(a => a.purchaseDate <= dateTo);
    if (statusFilter !== 'all') results = results.filter(a => a.status === statusFilter);
    if (categoryFilter !== 'all') results = results.filter(a => a.category === categoryFilter);

    setPreviewData(results);
    setHasSearched(true);
  };

  const handleExport = (format: 'csv' | 'print') => {
    if (previewData.length === 0) return;

    if (format === 'csv') {
      const headers = ['ID', 'Nama', 'Jenis', 'Kategori', 'Lokasi', 'Status', 'Kondisi', 'Ditugaskan Ke', 'Tanggal Beli'];
      const rows = previewData.map(a =>
        [a.id, a.name, a.type, a.category, a.location, a.status, a.condition, a.assignedTo, a.purchaseDate].join(',')
      );
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-aset-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Laporan diunduh', description: `${previewData.length} data aset berhasil diekspor ke CSV.` });
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#111827' }}>
            <Printer className="h-5 w-5" style={{ color: '#2563EB' }} />
            <span>Filter Laporan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">Tanggal Beli (Dari)</Label>
              <Input id="date-from" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Tanggal Beli (Sampai)</Label>
              <Input id="date-to" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Peripherals">Peripherals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
            <Search className="h-4 w-4 mr-2" />
            Tampilkan Data
          </Button>
        </CardContent>
      </Card>

      {/* Result Preview */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle style={{ color: '#111827' }}>Hasil Laporan</CardTitle>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                  Ditemukan <strong>{previewData.length}</strong> data aset
                </p>
              </div>
              {previewData.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('print')}>
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {previewData.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#6B7280' }}>
                <Printer className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Tidak ada data aset yang cocok dengan filter</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Ditugaskan</TableHead>
                        <TableHead>Tgl. Beli</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 50).map(asset => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.type}</TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              backgroundColor: asset.status === 'In Use' ? '#ECFDF5' : asset.status === 'Available' ? '#EFF6FF' : asset.status === 'Under Maintenance' ? '#FEF3C7' : '#F3F4F6',
                              color: asset.status === 'In Use' ? '#10B981' : asset.status === 'Available' ? '#2563EB' : asset.status === 'Under Maintenance' ? '#F59E0B' : '#6B7280',
                            }}>
                              {asset.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{asset.location}</TableCell>
                          <TableCell className="text-sm">{asset.assignedTo}</TableCell>
                          <TableCell className="text-sm">{asset.purchaseDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {previewData.length > 50 && (
                  <div className="px-4 py-2 text-xs text-center" style={{ backgroundColor: '#F9FAFB', color: '#6B7280' }}>
                    Menampilkan 50 dari {previewData.length} data. Export CSV untuk data lengkap.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export function AssetManagementPage() {
  const [allAssets, setAllAssets] = useState<Asset[]>(mockAssets);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Manajemen Aset</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
            Kelola data aset, jenis, dan cetak laporan
          </p>
        </div>

        <Tabs defaultValue="data-aset">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="data-aset" className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Data Aset
            </TabsTrigger>
            <TabsTrigger value="jenis-aset" className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Jenis Aset
            </TabsTrigger>
            <TabsTrigger value="cetak-laporan" className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Cetak Laporan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-aset" className="mt-4">
            <AssetTable
              assets={allAssets}
              onAssetsChange={(asset) => setAllAssets([asset, ...allAssets])}
              onEditAsset={(updated) => setAllAssets(updated)}
            />
          </TabsContent>

          <TabsContent value="jenis-aset" className="mt-4">
            <AssetTypesTab />
          </TabsContent>

          <TabsContent value="cetak-laporan" className="mt-4">
            <PrintReportTab />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  );
}
