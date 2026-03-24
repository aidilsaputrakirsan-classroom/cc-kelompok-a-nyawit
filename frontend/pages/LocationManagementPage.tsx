import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface Location {
  id: number;
  name: string;
  address: string;
  assetCount: number;
}

const initialLocations: Location[] = [
  { id: 1, name: 'New York Office', address: '1 Wall Street, New York, NY 10005', assetCount: 42 },
  { id: 2, name: 'San Francisco Office', address: '101 Market St, San Francisco, CA 94105', assetCount: 35 },
  { id: 3, name: 'London Office', address: '1 Canada Square, London E14 5AB', assetCount: 28 },
  { id: 4, name: 'Chicago Office', address: '233 S Wacker Dr, Chicago, IL 60606', assetCount: 19 },
  { id: 5, name: 'Warehouse', address: '500 Industrial Blvd, Newark, NJ 07101', assetCount: 61 },
  { id: 6, name: 'Remote', address: '-', assetCount: 14 },
];

type DialogMode = 'add' | 'edit' | null;

export function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setFormData({ name: '', address: '' });
    setDialogMode('add');
  };

  const openEdit = (loc: Location) => {
    setSelectedLocation(loc);
    setFormData({ name: loc.name, address: loc.address });
    setDialogMode('edit');
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (dialogMode === 'add') {
      const newLoc: Location = {
        id: Date.now(),
        name: formData.name.trim(),
        address: formData.address.trim() || '-',
        assetCount: 0,
      };
      setLocations([...locations, newLoc]);
      toast({ title: 'Lokasi ditambahkan', description: `${newLoc.name} berhasil ditambahkan.` });
    } else if (dialogMode === 'edit' && selectedLocation) {
      setLocations(locations.map(l =>
        l.id === selectedLocation.id
          ? { ...l, name: formData.name.trim(), address: formData.address.trim() || '-' }
          : l
      ));
      toast({ title: 'Lokasi diperbarui', description: `${formData.name} berhasil diperbarui.` });
    }
    setDialogMode(null);
  };

  const handleDelete = (id: number) => {
    const loc = locations.find(l => l.id === id);
    setLocations(locations.filter(l => l.id !== id));
    setDeleteConfirmId(null);
    toast({ title: 'Lokasi dihapus', description: `${loc?.name} berhasil dihapus.` });
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Manajemen Lokasi</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
            Kelola lokasi penyimpanan dan penempatan aset
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Total Lokasi', value: locations.length, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Total Aset', value: locations.reduce((s, l) => s + l.assetCount, 0), color: '#10B981', bg: '#ECFDF5' },
            { label: 'Rata-rata Aset', value: Math.round(locations.reduce((s, l) => s + l.assetCount, 0) / locations.length), color: '#F59E0B', bg: '#FEF3C7' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2" style={{ color: '#111827' }}>
                <MapPin className="h-5 w-5" style={{ color: '#2563EB' }} />
                <span>Daftar Lokasi</span>
              </div>
              <Button size="sm" onClick={openAdd} style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Lokasi
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#6B7280' }} />
              <Input
                placeholder="Cari lokasi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lokasi</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead className="text-center w-[100px]">Jumlah Aset</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8" style={{ color: '#6B7280' }}>
                        Tidak ada lokasi yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : filteredLocations.map(loc => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium" style={{ color: '#111827' }}>{loc.name}</TableCell>
                      <TableCell style={{ color: '#6B7280' }}>{loc.address}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                        >
                          {loc.assetCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(loc)}>
                            <Pencil className="h-4 w-4" style={{ color: '#6B7280' }} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeleteConfirmId(loc.id)}>
                            <Trash2 className="h-4 w-4" style={{ color: '#EF4444' }} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Tambah Lokasi Baru' : 'Edit Lokasi'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="loc-name">Nama Lokasi <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                id="loc-name"
                placeholder="Contoh: Jakarta Office"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-address">Alamat</Label>
              <Input
                id="loc-address"
                placeholder="Alamat lengkap (opsional)"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              {dialogMode === 'add' ? 'Tambahkan' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: '#EF4444' }}>Hapus Lokasi?</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Lokasi <strong style={{ color: '#111827' }}>{locations.find(l => l.id === deleteConfirmId)?.name}</strong> akan dihapus secara permanen. 
            Aset yang terkait tidak akan terhapus.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
