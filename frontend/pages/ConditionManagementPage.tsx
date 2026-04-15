import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Tag, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ConditionAPI, ConditionData } from '@/lib/api';

type Condition = ConditionData;

const colorOptions = [
  { label: 'Hijau (Baik)', color: '#10B981', bgColor: '#ECFDF5' },
  { label: 'Biru (Normal)', color: '#3B82F6', bgColor: '#DBEAFE' },
  { label: 'Kuning (Perhatian)', color: '#F59E0B', bgColor: '#FEF3C7' },
  { label: 'Merah (Buruk)', color: '#EF4444', bgColor: '#FEE2E2' },
  { label: 'Abu-abu (Lainnya)', color: '#6B7280', bgColor: '#F3F4F6' },
  { label: 'Ungu (Khusus)', color: '#8B5CF6', bgColor: '#F3E8FF' },
];

type DialogMode = 'add' | 'edit' | null;

export function ConditionManagementPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#10B981', bgColor: '#ECFDF5' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchConditions = async () => {
    setIsLoading(true);
    try {
      const data = await ConditionAPI.getAll();
      setConditions(data);
    } catch (error) {
      console.error('Failed to fetch conditions:', error);
      toast({ title: 'Gagal memuat', description: 'Terjadi kesalahan saat memuat data kondisi.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const filteredConditions = conditions.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setFormData({ name: '', description: '', color: '#10B981', bgColor: '#ECFDF5' });
    setDialogMode('add');
  };

  const openEdit = (cond: Condition) => {
    setSelectedCondition(cond);
    setFormData({ name: cond.name, description: cond.description, color: cond.color, bgColor: cond.bgColor });
    setDialogMode('edit');
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (dialogMode === 'add') {
      const newCond: Condition = {
        id: Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        bgColor: formData.bgColor,
        assetCount: 0,
      };
      setConditions([...conditions, newCond]);
      toast({ title: 'Kondisi ditambahkan', description: `${newCond.name} berhasil ditambahkan.` });
    } else if (dialogMode === 'edit' && selectedCondition) {
      setConditions(conditions.map(c =>
        c.id === selectedCondition.id
          ? { ...c, name: formData.name.trim(), description: formData.description.trim(), color: formData.color, bgColor: formData.bgColor }
          : c
      ));
      toast({ title: 'Kondisi diperbarui', description: `${formData.name} berhasil diperbarui.` });
    }
    setDialogMode(null);
  };

  const handleDelete = (id: number) => {
    const cond = conditions.find(c => c.id === id);
    if ((cond?.assetCount ?? 0) > 0) {
      toast({ title: 'Tidak dapat dihapus', description: 'Kondisi ini masih digunakan oleh beberapa aset.', variant: 'destructive' });
      setDeleteConfirmId(null);
      return;
    }
    setConditions(conditions.filter(c => c.id !== id));
    setDeleteConfirmId(null);
    toast({ title: 'Kondisi dihapus', description: `${cond?.name} berhasil dihapus.` });
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Manajemen Kondisi</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
            Kelola daftar kondisi yang dapat dipilih saat menginput aset
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {conditions.map(cond => (
            <Card key={cond.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: cond.bgColor, color: cond.color }}
                  >
                    {cond.name}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-1" style={{ color: cond.color }}>{cond.assetCount}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>aset</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2" style={{ color: '#111827' }}>
                <Tag className="h-5 w-5" style={{ color: '#2563EB' }} />
                <span>Daftar Kondisi</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={fetchConditions} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={openAdd} style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kondisi
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#6B7280' }} />
              <Input
                placeholder="Cari kondisi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Badge</TableHead>
                    <TableHead>Nama Kondisi</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center w-[100px]">Jumlah Aset</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConditions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8" style={{ color: '#6B7280' }}>
                        Tidak ada kondisi yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : filteredConditions.map(cond => (
                    <TableRow key={cond.id}>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: cond.bgColor, color: cond.color }}
                        >
                          {cond.name}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium" style={{ color: '#111827' }}>{cond.name}</TableCell>
                      <TableCell style={{ color: '#6B7280' }}>{cond.description}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                        >
                          {cond.assetCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(cond)}>
                            <Pencil className="h-4 w-4" style={{ color: '#6B7280' }} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeleteConfirmId(cond.id)}>
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
            <DialogTitle>{dialogMode === 'add' ? 'Tambah Kondisi Baru' : 'Edit Kondisi'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cond-name">Nama Kondisi <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                id="cond-name"
                placeholder="Contoh: Excellent"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cond-desc">Deskripsi</Label>
              <Input
                id="cond-desc"
                placeholder="Keterangan kondisi ini"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Warna Badge</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map(opt => (
                  <button
                    key={opt.color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: opt.color, bgColor: opt.bgColor })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left"
                    style={{
                      borderColor: formData.color === opt.color ? opt.color : '#E5E7EB',
                      backgroundColor: formData.color === opt.color ? opt.bgColor : 'transparent',
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span className="text-xs" style={{ color: '#374151' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs" style={{ color: '#6B7280' }}>Preview:</span>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: formData.bgColor, color: formData.color }}
                >
                  {formData.name || 'Kondisi'}
                </span>
              </div>
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
            <DialogTitle style={{ color: '#EF4444' }}>Hapus Kondisi?</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Kondisi <strong style={{ color: '#111827' }}>{conditions.find(c => c.id === deleteConfirmId)?.name}</strong> akan dihapus.
            {(conditions.find(c => c.id === deleteConfirmId)?.assetCount ?? 0) > 0 && (
              <span style={{ color: '#EF4444' }}> Kondisi ini masih digunakan, tidak dapat dihapus.</span>
            )}
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
