import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { API_BASE_URL } from '@/lib/api';

interface Location {
  id: number;
  name: string;
  address: string | null;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

type DialogMode = 'add' | 'edit' | null;

// Helper to get auth token
function getAuthToken(): string | null {
  const session = localStorage.getItem('asset-manager-session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/locations');
      setLocations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data lokasi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAdd = () => {
    setFormData({ name: '', address: '' });
    setDialogMode('add');
  };

  const openEdit = (loc: Location) => {
    setSelectedLocation(loc);
    setFormData({ name: loc.name, address: loc.address || '' });
    setDialogMode('edit');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (dialogMode === 'add') {
        await fetchWithAuth('/locations', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name.trim(),
            address: formData.address.trim() || null
          })
        });
        toast({ title: 'Lokasi ditambahkan', description: `${formData.name} berhasil ditambahkan.` });
      } else if (dialogMode === 'edit' && selectedLocation) {
        await fetchWithAuth(`/locations/${selectedLocation.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name.trim(),
            address: formData.address.trim() || null
          })
        });
        toast({ title: 'Lokasi diperbarui', description: `${formData.name} berhasil diperbarui.` });
      }
      setDialogMode(null);
      fetchLocations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const loc = locations.find(l => l.id === id);
    try {
      await fetchWithAuth(`/locations/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      toast({ title: 'Lokasi dihapus', description: `${loc?.name} berhasil dihapus.` });
      fetchLocations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menghapus lokasi',
        variant: 'destructive'
      });
    }
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
            { label: 'Total Aset', value: locations.reduce((s, l) => s + l.asset_count, 0), color: '#10B981', bg: '#ECFDF5' },
            { label: 'Rata-rata Aset', value: locations.length > 0 ? Math.round(locations.reduce((s, l) => s + l.asset_count, 0) / locations.length) : 0, color: '#F59E0B', bg: '#FEF3C7' },
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8" style={{ color: '#6B7280' }}>
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredLocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8" style={{ color: '#6B7280' }}>
                        Tidak ada lokasi yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : filteredLocations.map(loc => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium" style={{ color: '#111827' }}>{loc.name}</TableCell>
                      <TableCell style={{ color: '#6B7280' }}>{loc.address || '-'}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                        >
                          {loc.asset_count}
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
                placeholder="Contoh: Jl. Sudirman No. 1, Jakarta"
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
