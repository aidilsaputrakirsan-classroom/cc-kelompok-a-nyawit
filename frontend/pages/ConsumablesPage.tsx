import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Minus, PackagePlus, PackageMinus, AlertTriangle, Search,
  FlaskConical, ChevronUp, ChevronDown, TrendingUp, TrendingDown, History
} from 'lucide-react';
import { mockConsumables, type Consumable } from '@/data/mockAssets';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockLog {
  id: string;
  consumableId: string;
  consumableName: string;
  type: 'tambah' | 'kurang';
  qty: number;
  before: number;
  after: number;
  picName: string;
  date: string;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockLevel(stock: number, min: number): 'critical' | 'low' | 'ok' {
  if (stock <= Math.floor(min / 2)) return 'critical';
  if (stock <= min) return 'low';
  return 'ok';
}

function StockBadge({ stock, min }: { stock: number; min: number }) {
  const level = stockLevel(stock, min);
  const cfg = {
    critical: { bg: '#FEE2E2', color: '#DC2626', label: 'Kritis', icon: <AlertTriangle className="h-3 w-3" /> },
    low:      { bg: '#FEF3C7', color: '#D97706', label: 'Rendah', icon: <TrendingDown className="h-3 w-3" /> },
    ok:       { bg: '#ECFDF5', color: '#059669', label: 'Aman',   icon: <TrendingUp className="h-3 w-3" /> },
  }[level];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}
      {stock} • {cfg.label}
    </span>
  );
}

// ─── Adjust Dialog ────────────────────────────────────────────────────────────

interface AdjustDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: 'tambah' | 'kurang';
  consumable: Consumable | null;
  allConsumables: Consumable[];
  onSave: (consumableId: string, qty: number, picName: string, date: string, notes: string) => void;
}

function AdjustDialog({ open, onOpenChange, mode, consumable, allConsumables, onSave }: AdjustDialogProps) {
  const [selectedId, setSelectedId] = useState<string>(consumable?.id ?? '');
  const [qty, setQty] = useState('1');
  const [picName, setPicName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Reset when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setSelectedId(consumable?.id ?? '');
      setQty('1');
      setPicName('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    onOpenChange(v);
  };

  const selected = allConsumables.find(c => c.id === selectedId);
  const qtyNum = parseInt(qty) || 0;
  const isKurang = mode === 'kurang';
  const stockAfter = selected ? (isKurang ? selected.stock - qtyNum : selected.stock + qtyNum) : 0;
  const overStock = isKurang && selected ? qtyNum > selected.stock : false;
  const isValid = selectedId && qtyNum > 0 && picName.trim() && !overStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave(selectedId, qtyNum, picName.trim(), date, notes.trim());
    toast({
      title: `Stok ${isKurang ? 'dikurangi' : 'ditambahkan'}`,
      description: `${selected?.name}: ${isKurang ? 'berkurang' : 'bertambah'} ${qtyNum} ${selected?.unit}`,
    });
    onOpenChange(false);
  };

  const color = isKurang ? '#EF4444' : '#10B981';
  const Icon = isKurang ? PackageMinus : PackagePlus;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color }}>
            <Icon className="h-5 w-5" />
            {isKurang ? 'Barang Keluar / Digunakan' : 'Barang Masuk / Restok'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Item <span style={{ color: '#EF4444' }}>*</span></Label>
            <Select value={selectedId} onValueChange={setSelectedId} required>
              <SelectTrigger><SelectValue placeholder="Pilih item..." /></SelectTrigger>
              <SelectContent>
                {allConsumables.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — stok: {c.stock} {c.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jumlah <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                type="number"
                min={1}
                max={isKurang && selected ? selected.stock : undefined}
                value={qty}
                onChange={e => setQty(e.target.value)}
                required
              />
              {overStock && (
                <p className="text-xs" style={{ color: '#EF4444' }}>
                  Melebihi stok tersedia ({selected?.stock} {selected?.unit})
                </p>
              )}
            </div>

            {selected && (
              <div className="space-y-1.5">
                <Label>Stok Setelah</Label>
                <div
                  className="flex items-center h-9 px-3 rounded-md border text-sm font-semibold"
                  style={{
                    backgroundColor: overStock ? '#FEE2E2' : stockAfter <= (selected.minStock ?? 5) ? '#FEF3C7' : '#ECFDF5',
                    color: overStock ? '#DC2626' : stockAfter <= (selected.minStock ?? 5) ? '#D97706' : '#059669',
                    borderColor: '#E5E7EB',
                  }}
                >
                  {overStock ? '—' : `${stockAfter} ${selected.unit}`}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>PIC <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                placeholder="Nama lengkap..."
                value={picName}
                onChange={e => setPicName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (opsional)</Label>
            <Textarea
              placeholder="Keterangan tambahan..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button
              type="submit"
              disabled={!isValid}
              style={{ backgroundColor: color, color: '#FFFFFF' }}
            >
              {isKurang ? 'Catat Keluar' : 'Catat Masuk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Item Dialog ──────────────────────────────────────────────────────────

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (item: Omit<Consumable, 'id' | 'lastUpdate'>) => void;
}

const locations = ['Rak A', 'Rak B', 'Rak C', 'Rak D', 'Rak E', 'Rak F', 'Lantai', 'Lemari kaca'];
const consumableTypes = ['Tinta Printer', 'Cartridge', 'Kabel Jaringan', 'Kertas', 'Baterai', 'Lainnya'];

function AddItemDialog({ open, onOpenChange, onSave }: AddItemDialogProps) {
  const [form, setForm] = useState({
    name: '', type: 'Tinta Printer', location: 'Rak A',
    stock: '0', unit: 'pcs', minStock: '5',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      type: form.type,
      category: 'Consumables',
      location: form.location,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      minStock: parseInt(form.minStock) || 5,
    });
    setForm({ name: '', type: 'Tinta Printer', location: 'Rak A', stock: '0', unit: 'pcs', minStock: '5' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#7C3AED' }}>Tambah Item Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nama Item <span style={{ color: '#EF4444' }}>*</span></Label>
            <Input
              placeholder="Contoh: Tinta Printer Cyan"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jenis</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {consumableTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Lokasi</Label>
              <Select value={form.location} onValueChange={v => setForm(f => ({ ...f, location: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Stok Awal</Label>
              <Input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Satuan</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pcs', 'roll', 'box', 'lusin', 'rim'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Min. Stok</Label>
              <Input type="number" min={1} value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={!form.name.trim()} style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}>
              Tambahkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ConsumablesPage() {
  const [consumables, setConsumables] = useState<Consumable[]>(mockConsumables);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Dialog state
  const [adjustMode, setAdjustMode] = useState<'tambah' | 'kurang'>('tambah');
  const [adjustTarget, setAdjustTarget] = useState<Consumable | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { toast } = useToast();

  const allTypes = useMemo(() => Array.from(new Set(consumables.map(c => c.type))), [consumables]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return consumables
      .filter(c => typeFilter === 'all' || c.type === typeFilter)
      .filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
      .sort((a, b) => sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [consumables, search, typeFilter, sortDir]);

  const openAdjust = (mode: 'tambah' | 'kurang', item: Consumable) => {
    setAdjustMode(mode);
    setAdjustTarget(item);
    setAdjustOpen(true);
  };

  const handleAdjust = (consumableId: string, qty: number, picName: string, date: string, notes: string) => {
    const today = new Date().toISOString().split('T')[0];
    setConsumables(prev => prev.map(c => {
      if (c.id !== consumableId) return c;
      const before = c.stock;
      const after = adjustMode === 'kurang' ? before - qty : before + qty;
      setLogs(l => [{
        id: `LOG-${Date.now()}`,
        consumableId,
        consumableName: c.name,
        type: adjustMode,
        qty,
        before,
        after,
        picName,
        date,
        notes: notes || undefined,
      } as StockLog, ...l]);
      return { ...c, stock: after, lastUpdate: today };
    }));
  };

  const handleAddItem = (item: Omit<Consumable, 'id' | 'lastUpdate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: Consumable = {
      ...item,
      id: `CON-${String(consumables.length + 1).padStart(3, '0')}`,
      lastUpdate: today,
    };
    setConsumables(prev => [...prev, newItem]);
    toast({ title: 'Item ditambahkan', description: `${newItem.name} berhasil didaftarkan.` });
  };

  // Summary stats
  const critical = consumables.filter(c => stockLevel(c.stock, c.minStock) === 'critical').length;
  const low = consumables.filter(c => stockLevel(c.stock, c.minStock) === 'low').length;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
              <FlaskConical className="h-7 w-7" style={{ color: '#7C3AED' }} />
              Barang Habis Pakai
            </h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
              Kelola stok consumables — tinta, cartridge, kabel, dan lainnya
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Item
          </Button>
        </div>

        {/* Summary cards */}
        {(critical > 0 || low > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Total Item</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{consumables.length}</p>
                  </div>
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
                    <FlaskConical className="h-5 w-5" style={{ color: '#7C3AED' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            {critical > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Stok Kritis</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#DC2626' }}>{critical}</p>
                    </div>
                    <div className="p-2 rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
                      <AlertTriangle className="h-5 w-5" style={{ color: '#DC2626' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {low > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Stok Rendah</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#D97706' }}>{low}</p>
                    </div>
                    <div className="p-2 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
                      <TrendingDown className="h-5 w-5" style={{ color: '#D97706' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stock table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span style={{ color: '#111827' }}>Daftar Stok</span>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
                  <Input
                    placeholder="Cari item..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    {allTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1 font-medium hover:text-foreground"
                          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                        >
                          Nama Item
                          {sortDir === 'asc'
                            ? <ChevronUp className="h-3 w-3" />
                            : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead className="text-center">Stok</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update</TableHead>
                      <TableHead className="text-center w-[120px]">Adjust</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10" style={{ color: '#9CA3AF' }}>
                          Tidak ada data consumables
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-sm" style={{ color: '#111827' }}>{item.name}</p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.id}</p>
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}
                          >
                            {item.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: '#374151' }}>{item.location}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-sm" style={{ color: '#111827' }}>
                            {item.stock} <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>{item.unit}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <StockBadge stock={item.stock} min={item.minStock} />
                        </TableCell>
                        <TableCell className="text-xs" style={{ color: '#6B7280' }}>
                          {new Date(item.lastUpdate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              title="Tambah stok"
                              onClick={() => openAdjust('tambah', item)}
                              className="flex items-center justify-center h-8 w-8 rounded-lg border transition-all hover:opacity-80"
                              style={{ borderColor: '#10B981', backgroundColor: '#ECFDF5', color: '#10B981' }}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Kurangi stok"
                              disabled={item.stock === 0}
                              onClick={() => openAdjust('kurang', item)}
                              className="flex items-center justify-center h-8 w-8 rounded-lg border transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ borderColor: '#EF4444', backgroundColor: '#FEE2E2', color: '#EF4444' }}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Menampilkan {filtered.length} dari {consumables.length} item</p>
          </CardContent>
        </Card>

        {/* History log */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#111827' }}>
                <History className="h-5 w-5" style={{ color: '#7C3AED' }} />
                Riwayat Penyesuaian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Jenis</TableHead>
                        <TableHead className="text-center">Perubahan</TableHead>
                        <TableHead className="text-center">Sebelum → Sesudah</TableHead>
                        <TableHead>PIC</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium text-sm" style={{ color: '#111827' }}>{log.consumableName}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: log.type === 'tambah' ? '#ECFDF5' : '#FEE2E2',
                                color: log.type === 'tambah' ? '#10B981' : '#EF4444',
                              }}
                            >
                              {log.type === 'tambah' ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                              {log.type === 'tambah' ? 'Masuk' : 'Keluar'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-semibold" style={{ color: log.type === 'tambah' ? '#10B981' : '#EF4444' }}>
                            {log.type === 'tambah' ? '+' : '−'}{log.qty}
                          </TableCell>
                          <TableCell className="text-center text-sm" style={{ color: '#374151' }}>
                            {log.before} → {log.after}
                          </TableCell>
                          <TableCell className="text-sm" style={{ color: '#374151' }}>{log.picName}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap" style={{ color: '#6B7280' }}>
                            {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-xs" style={{ color: '#9CA3AF' }}>{log.notes ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        mode={adjustMode}
        consumable={adjustTarget}
        allConsumables={consumables}
        onSave={handleAdjust}
      />

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleAddItem}
      />

      <Toaster />
    </>
  );
}
