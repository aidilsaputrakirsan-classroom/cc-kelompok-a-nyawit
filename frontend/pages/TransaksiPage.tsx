import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  PackagePlus, PackageMinus, ArrowLeftRight, SlidersHorizontal,
  Plus, Search, TrendingUp, TrendingDown, ChevronUp, ChevronDown
} from 'lucide-react';
import { mockTransactions, type Transaction, type TransactionType } from '@/data/mockTransactions';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// ─── Constants ────────────────────────────────────────────────────────────────

const locations = ['Rak A', 'Rak B', 'Rak C', 'Rak D', 'Rak E', 'Rak F', 'Lantai', 'Lemari kaca'];
const assetNames = [
  'Laptop Dell XPS', 'Monitor LG 24"', 'Keyboard Logitech', 'Mouse Wireless',
  'Server HP ProLiant', 'Printer Epson', 'Webcam Logitech', 'Headset Sony',
  'Tablet Samsung', 'Desktop PC', 'Switch Jaringan', 'UPS APC'
];
const categories = ['Hardware', 'Peripherals'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeLabel(type: TransactionType) {
  const map: Record<TransactionType, string> = {
    masuk: 'Barang Masuk',
    keluar: 'Barang Keluar',
    mutasi: 'Mutasi',
    adjust: 'Adjust',
  };
  return map[type];
}

function TypeBadge({ type, adjustType }: { type: TransactionType; adjustType?: string }) {
  const configs: Record<TransactionType, { bg: string; color: string; icon: React.ReactNode }> = {
    masuk:  { bg: '#ECFDF5', color: '#10B981', icon: <PackagePlus  className="h-3 w-3" /> },
    keluar: { bg: '#FEE2E2', color: '#EF4444', icon: <PackageMinus className="h-3 w-3" /> },
    mutasi: { bg: '#EFF6FF', color: '#2563EB', icon: <ArrowLeftRight className="h-3 w-3" /> },
    adjust: {
      bg: adjustType === 'tambah' ? '#FEF3C7' : '#F3F4F6',
      color: adjustType === 'tambah' ? '#D97706' : '#6B7280',
      icon: adjustType === 'tambah'
        ? <TrendingUp className="h-3 w-3" />
        : <TrendingDown className="h-3 w-3" />,
    },
  };
  const c = configs[type];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.icon}
      {type === 'adjust' ? `Adjust ${adjustType === 'tambah' ? '(+)' : '(-)'}` : typeLabel(type)}
    </span>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  const masuk  = transactions.filter(t => t.type === 'masuk').length;
  const keluar = transactions.filter(t => t.type === 'keluar').length;
  const mutasi = transactions.filter(t => t.type === 'mutasi').length;
  const adjust = transactions.filter(t => t.type === 'adjust').length;

  const cards = [
    { label: 'Barang Masuk',  value: masuk,  color: '#10B981', bg: '#ECFDF5', icon: PackagePlus },
    { label: 'Barang Keluar', value: keluar, color: '#EF4444', bg: '#FEE2E2', icon: PackageMinus },
    { label: 'Mutasi',        value: mutasi, color: '#2563EB', bg: '#EFF6FF', icon: ArrowLeftRight },
    { label: 'Adjust',        value: adjust, color: '#D97706', bg: '#FEF3C7', icon: SlidersHorizontal },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(c => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{c.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{c.value}</p>
                </div>
                <div className="p-2 rounded-full" style={{ backgroundColor: c.bg }}>
                  <Icon className="h-5 w-5" style={{ color: c.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Transaction Table ────────────────────────────────────────────────────────

function TransactionTable({
  transactions,
  type,
}: {
  transactions: Transaction[];
  type: TransactionType | 'all';
}) {
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions
      .filter(t => type === 'all' || t.type === type)
      .filter(t =>
        t.assetName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.picName.toLowerCase().includes(q)
      )
      .sort((a, b) => sortDir === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
      );
  }, [transactions, type, search, sortDir]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
          <Input
            placeholder="Cari aset, ID, atau PIC..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">No. Transaksi</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center w-[80px]">Qty</TableHead>
                <TableHead>Lokasi / Asal → Tujuan</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 font-medium hover:text-foreground"
                    onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  >
                    Tanggal
                    {sortDir === 'asc'
                      ? <ChevronUp className="h-3 w-3" />
                      : <ChevronDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                {type === 'all' && <TableHead>Jenis</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={type === 'all' ? 8 : 7} className="text-center py-10" style={{ color: '#9CA3AF' }}>
                    Tidak ada data transaksi
                  </TableCell>
                </TableRow>
              ) : filtered.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs" style={{ color: '#6B7280' }}>{tx.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#111827' }}>{tx.assetName}</p>
                      {tx.notes && <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{tx.notes}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: tx.category === 'Hardware' ? '#EFF6FF' : '#FEF3C7',
                        color: tx.category === 'Hardware' ? '#2563EB' : '#D97706'
                      }}
                    >
                      {tx.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-semibold" style={{ color: '#111827' }}>{tx.quantity}</TableCell>
                  <TableCell className="text-sm" style={{ color: '#374151' }}>
                    {tx.type === 'mutasi'
                      ? <span className="flex items-center gap-1">
                          <span style={{ color: '#6B7280' }}>{tx.fromLocation}</span>
                          <ArrowLeftRight className="h-3 w-3 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                          <span style={{ color: '#2563EB' }}>{tx.toLocation}</span>
                        </span>
                      : tx.location ?? '-'}
                  </TableCell>
                  <TableCell className="text-sm" style={{ color: '#374151' }}>{tx.picName}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap" style={{ color: '#6B7280' }}>
                    {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  {type === 'all' && (
                    <TableCell>
                      <TypeBadge type={tx.type} adjustType={tx.adjustType} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs" style={{ color: '#9CA3AF' }}>Menampilkan {filtered.length} transaksi</p>
    </div>
  );
}

// ─── Form Dialog (shared for all 4 types) ─────────────────────────────────────

interface FormState {
  assetName: string;
  category: string;
  quantity: string;
  location: string;
  fromLocation: string;
  toLocation: string;
  adjustType: 'tambah' | 'kurang';
  picName: string;
  date: string;
  notes: string;
  reason: string;
}

const emptyForm: FormState = {
  assetName: '',
  category: 'Hardware',
  quantity: '1',
  location: '',
  fromLocation: '',
  toLocation: '',
  adjustType: 'tambah',
  picName: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  reason: '',
};

function TransactionFormDialog({
  open,
  onOpenChange,
  type,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: TransactionType;
  onSave: (tx: Transaction) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const { toast } = useToast();

  const set = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prefixMap: Record<TransactionType, string> = {
      masuk: 'MSK', keluar: 'KLR', mutasi: 'MUT', adjust: 'ADJ'
    };
    const id = `${prefixMap[type]}-${Date.now().toString().slice(-6)}`;

    const base: Transaction = {
      id,
      type,
      date: form.date,
      assetId: `AST-${Date.now().toString().slice(-4)}`,
      assetName: form.assetName,
      category: form.category,
      quantity: parseInt(form.quantity) || 1,
      picName: form.picName,
      notes: form.notes || undefined,
      createdAt: form.date,
    };

    if (type === 'masuk' || type === 'keluar') {
      onSave({ ...base, location: form.location, reason: form.reason || undefined });
    } else if (type === 'mutasi') {
      onSave({ ...base, fromLocation: form.fromLocation, toLocation: form.toLocation });
    } else {
      onSave({ ...base, location: form.location, adjustType: form.adjustType, reason: form.reason || undefined });
    }

    toast({
      title: 'Transaksi berhasil dicatat',
      description: `${typeLabel(type)} untuk ${form.assetName} telah disimpan.`,
    });

    setForm(emptyForm);
    onOpenChange(false);
  };

  const titles: Record<TransactionType, string> = {
    masuk:  'Catat Barang Masuk',
    keluar: 'Catat Barang Keluar',
    mutasi: 'Catat Mutasi Barang',
    adjust: 'Catat Penyesuaian (Adjust)',
  };
  const colors: Record<TransactionType, string> = {
    masuk: '#10B981', keluar: '#EF4444', mutasi: '#2563EB', adjust: '#D97706'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: colors[type] }}>{titles[type]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Asset selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Nama Aset <span style={{ color: '#EF4444' }}>*</span></Label>
              <Select value={form.assetName} onValueChange={v => set('assetName', v)} required>
                <SelectTrigger><SelectValue placeholder="Pilih aset..." /></SelectTrigger>
                <SelectContent>
                  {assetNames.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Jumlah <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location fields — depends on type */}
          {(type === 'masuk' || type === 'keluar') && (
            <div className="space-y-1.5">
              <Label>Lokasi {type === 'masuk' ? 'Tujuan' : 'Asal'} <span style={{ color: '#EF4444' }}>*</span></Label>
              <Select value={form.location} onValueChange={v => set('location', v)} required>
                <SelectTrigger><SelectValue placeholder="Pilih lokasi..." /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'mutasi' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Dari Lokasi <span style={{ color: '#EF4444' }}>*</span></Label>
                <Select value={form.fromLocation} onValueChange={v => set('fromLocation', v)} required>
                  <SelectTrigger><SelectValue placeholder="Asal..." /></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ke Lokasi <span style={{ color: '#EF4444' }}>*</span></Label>
                <Select value={form.toLocation} onValueChange={v => set('toLocation', v)} required>
                  <SelectTrigger><SelectValue placeholder="Tujuan..." /></SelectTrigger>
                  <SelectContent>
                    {locations.filter(l => l !== form.fromLocation).map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === 'adjust' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lokasi <span style={{ color: '#EF4444' }}>*</span></Label>
                <Select value={form.location} onValueChange={v => set('location', v)} required>
                  <SelectTrigger><SelectValue placeholder="Pilih lokasi..." /></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Adjust</Label>
                <Select value={form.adjustType} onValueChange={v => set('adjustType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tambah">Tambah (+) — Barang ditemukan</SelectItem>
                    <SelectItem value="kurang">Kurang (−) — Barang hilang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Reason */}
          {(type !== 'mutasi') && (
            <div className="space-y-1.5">
              <Label>Alasan / Keterangan</Label>
              <Input
                placeholder={
                  type === 'masuk' ? 'Contoh: Pembelian baru, Retur dari supplier...'
                  : type === 'keluar' ? 'Contoh: Permintaan divisi, Penghapusan aset...'
                  : 'Contoh: Temuan audit, Lupa tercatat...'
                }
                value={form.reason}
                onChange={e => set('reason', e.target.value)}
              />
            </div>
          )}

          {/* PIC & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>PIC (Penanggung Jawab) <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                placeholder="Nama lengkap..."
                value={form.picName}
                onChange={e => set('picName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Catatan (opsional)</Label>
            <Textarea
              placeholder="Catatan tambahan..."
              value={form.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('notes', e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button
              type="submit"
              disabled={!form.assetName || !form.picName}
              style={{ backgroundColor: colors[type], color: '#FFFFFF' }}
            >
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function TabContent({
  type,
  transactions,
  onAdd,
}: {
  type: TransactionType;
  transactions: Transaction[];
  onAdd: (tx: Transaction) => void;
}) {
  const [open, setOpen] = useState(false);

  const configs: Record<TransactionType, { label: string; color: string; desc: string }> = {
    masuk:  { label: 'Catat Barang Masuk',  color: '#10B981', desc: 'Pencatatan aset yang baru diterima atau dikembalikan ke gudang.' },
    keluar: { label: 'Catat Barang Keluar', color: '#EF4444', desc: 'Pencatatan aset yang dikeluarkan, dikirim, atau dihapus dari inventaris.' },
    mutasi: { label: 'Catat Mutasi',        color: '#2563EB', desc: 'Pemindahan aset dari satu lokasi penyimpanan ke lokasi lain.' },
    adjust: { label: 'Catat Adjust',        color: '#D97706', desc: 'Penyesuaian stok untuk barang yang lupa tercatat atau ditemukan hilang.' },
  };

  const cfg = configs[type];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold" style={{ color: '#111827' }}>{typeLabel(type)}</p>
              <p className="text-xs font-normal mt-0.5" style={{ color: '#6B7280' }}>{cfg.desc}</p>
            </div>
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              style={{ backgroundColor: cfg.color, color: '#FFFFFF' }}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              {cfg.label}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={transactions} type={type} />
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={open}
        onOpenChange={setOpen}
        type={type}
        onSave={onAdd}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [allOpen, setAllOpen] = useState(false);
  const [addType, setAddType] = useState<TransactionType>('masuk');

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const openAddDialog = (type: TransactionType) => {
    setAddType(type);
    setAllOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Manajemen Transaksi</h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
              Catat semua pergerakan aset: masuk, keluar, mutasi, dan penyesuaian
            </p>
          </div>
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2">
            {(['masuk', 'keluar', 'mutasi', 'adjust'] as TransactionType[]).map(type => {
              const icons = { masuk: PackagePlus, keluar: PackageMinus, mutasi: ArrowLeftRight, adjust: SlidersHorizontal };
              const colors = { masuk: '#10B981', keluar: '#EF4444', mutasi: '#2563EB', adjust: '#D97706' };
              const Icon = icons[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => openAddDialog(type)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: colors[type], color: colors[type], backgroundColor: `${colors[type]}10` }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {typeLabel(type)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <SummaryCards transactions={transactions} />

        {/* Tabs */}
        <Tabs defaultValue="semua">
          <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
            <TabsTrigger value="semua" className="flex items-center gap-1.5">Semua</TabsTrigger>
            <TabsTrigger value="masuk"  className="flex items-center gap-1.5">
              <PackagePlus className="h-3.5 w-3.5" /> Barang Masuk
            </TabsTrigger>
            <TabsTrigger value="keluar" className="flex items-center gap-1.5">
              <PackageMinus className="h-3.5 w-3.5" /> Barang Keluar
            </TabsTrigger>
            <TabsTrigger value="mutasi" className="flex items-center gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Mutasi
            </TabsTrigger>
            <TabsTrigger value="adjust" className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
            </TabsTrigger>
          </TabsList>

          <TabsContent value="semua" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#111827' }}>Semua Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={transactions} type="all" />
              </CardContent>
            </Card>
          </TabsContent>

          {(['masuk', 'keluar', 'mutasi', 'adjust'] as TransactionType[]).map(type => (
            <TabsContent key={type} value={type} className="mt-4">
              <TabContent type={type} transactions={transactions} onAdd={addTransaction} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Global quick-add dialog */}
      <TransactionFormDialog
        open={allOpen}
        onOpenChange={setAllOpen}
        type={addType}
        onSave={addTransaction}
      />

      <Toaster />
    </>
  );
}
