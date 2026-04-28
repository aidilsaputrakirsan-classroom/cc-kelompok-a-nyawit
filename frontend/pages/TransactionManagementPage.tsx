import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, ArrowRightLeft, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { TransactionAPI, Transaction, TransactionType, Asset, Location, AssetAPI, LocationAPI } from '@/lib/api';

interface TransactionWithDetails extends Transaction {
    asset?: Asset;
    from_location?: Location;
    to_location?: Location;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
    { value: 'adjustment out', label: 'Adjustment Out' },
    { value: 'adjustment in', label: 'Adjustment In' },
    { value: 'mutasi in', label: 'Mutasi In' },
    { value: 'mutasi out', label: 'Mutasi Out' },
    { value: 'in', label: 'In' },
    { value: 'out', label: 'Out' },
];

type DialogMode = 'add' | 'edit' | null;

export function TransactionManagementPage() {
    const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState({
        asset_id: '',
        from_location_id: '',
        to_location_id: '',
        transaction_type: 'in' as TransactionType,
        quantity: '1',
        notes: ''
    });
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const { toast } = useToast();

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const transactionsData = await TransactionAPI.getAll();
            const [assetsResult, locationsResult] = await Promise.allSettled([
                AssetAPI.getAll(),
                LocationAPI.getAll(),
            ]);

            const assetsData = assetsResult.status === 'fulfilled' ? assetsResult.value : [];
            const locationsData = locationsResult.status === 'fulfilled' ? locationsResult.value : [];

            // Enrich transactions with asset and location details
            const enrichedTransactions = transactionsData.map((transaction: Transaction) => ({
                ...transaction,
                asset: assetsData.find((a: Asset) => String(a.id) === String(transaction.asset_id)),
                from_location: transaction.from_location_id ? locationsData.find((l: Location) => l.id === transaction.from_location_id) : undefined,
                to_location: transaction.to_location_id ? locationsData.find((l: Location) => l.id === transaction.to_location_id) : undefined,
            }));

            setTransactions(enrichedTransactions);
            setAssets(assetsData);
            setLocations(locationsData);

            if (assetsResult.status === 'rejected' || locationsResult.status === 'rejected') {
                toast({
                    title: 'Peringatan',
                    description: 'Sebagian data pelengkap transaksi tidak terbaca, namun data transaksi utama tetap ditampilkan.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Gagal memuat data transaksi',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        const assetName = transaction.asset?.name?.toLowerCase() || '';
        const fromLocation = transaction.from_location?.name?.toLowerCase() || '';
        const toLocation = transaction.to_location?.name?.toLowerCase() || '';
        const type = transaction.transaction_type.toLowerCase();
        const query = searchQuery.toLowerCase();

        return assetName.includes(query) ||
            fromLocation.includes(query) ||
            toLocation.includes(query) ||
            type.includes(query);
    });

    const openAdd = () => {
        setFormData({
            asset_id: '',
            from_location_id: '',
            to_location_id: '',
            transaction_type: 'in',
            quantity: '1',
            notes: ''
        });
        setDialogMode('add');
    };

    const openEdit = (transaction: TransactionWithDetails) => {
        setSelectedTransaction(transaction);
        setFormData({
            asset_id: transaction.asset_id.toString(),
            from_location_id: transaction.from_location_id?.toString() || '',
            to_location_id: transaction.to_location_id?.toString() || '',
            transaction_type: transaction.transaction_type,
            quantity: transaction.quantity.toString(),
            notes: transaction.notes || ''
        });
        setDialogMode('edit');
    };

    const handleSave = async () => {
        if (!formData.asset_id) return;

        try {
            const data = {
                asset_id: parseInt(formData.asset_id),
                from_location_id: formData.from_location_id ? parseInt(formData.from_location_id) : undefined,
                to_location_id: formData.to_location_id ? parseInt(formData.to_location_id) : undefined,
                transaction_type: formData.transaction_type,
                quantity: parseInt(formData.quantity) || 1,
                notes: formData.notes || undefined
            };

            if (dialogMode === 'add') {
                await TransactionAPI.create(data);
                toast({ title: 'Transaksi ditambahkan', description: 'Transaksi berhasil ditambahkan.' });
            } else if (dialogMode === 'edit' && selectedTransaction) {
                await TransactionAPI.update(selectedTransaction.id, data);
                toast({ title: 'Transaksi diperbarui', description: 'Transaksi berhasil diperbarui.' });
            }
            setDialogMode(null);
            fetchData();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await TransactionAPI.delete(id);
            setDeleteConfirmId(null);
            toast({ title: 'Transaksi dihapus', description: 'Transaksi berhasil dihapus.' });
            fetchData();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Gagal menghapus transaksi',
                variant: 'destructive'
            });
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Transaksi</h1>
                    <p className="text-xs md:text-sm mt-1 text-gray-500">
                        Kelola perpindahan barang antar lokasi
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Transaksi', value: transactions.length, colorClass: 'text-blue-600' },
                        { label: 'Adjustment', value: transactions.filter(t => t.transaction_type.includes('adjustment')).length, colorClass: 'text-emerald-500' },
                        { label: 'Mutasi', value: transactions.filter(t => t.transaction_type.includes('mutasi')).length, colorClass: 'text-amber-500' },
                        { label: 'In/Out', value: transactions.filter(t => t.transaction_type === 'in' || t.transaction_type === 'out').length, colorClass: 'text-violet-600' },
                    ].map(stat => (
                        <Card key={stat.label}>
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                                <p className={`text-2xl font-bold mt-1 ${stat.colorClass}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-gray-900">
                                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                                <span>Daftar Transaksi</span>
                            </div>
                            <Button size="sm" onClick={openAdd} className="bg-blue-600 text-white hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Transaksi
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
                            <Input
                                placeholder="Cari transaksi..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Aset</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead>Dari</TableHead>
                                        <TableHead>Ke</TableHead>
                                        <TableHead>Jumlah</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                Memuat data...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                Tidak ada transaksi yang ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredTransactions.map(transaction => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium text-gray-900">
                                                {transaction.asset?.name || `Asset ${transaction.asset_id}`}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                                                    {transaction.transaction_type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {transaction.from_location?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {transaction.to_location?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-gray-900">
                                                    {transaction.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(transaction)}>
                                                        <Pencil className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeleteConfirmId(transaction.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
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
                        <DialogTitle>{dialogMode === 'add' ? 'Tambah Transaksi Baru' : 'Edit Transaksi'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Aset <span className="text-red-500">*</span></Label>
                            <Select value={formData.asset_id} onValueChange={v => setFormData({ ...formData, asset_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih aset" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id.toString()}>
                                            {asset.name} ({asset.asset_code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe Transaksi</Label>
                            <Select value={formData.transaction_type} onValueChange={v => setFormData({ ...formData, transaction_type: v as TransactionType })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRANSACTION_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dari Lokasi</Label>
                                <Select value={formData.from_location_id} onValueChange={v => setFormData({ ...formData, from_location_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih lokasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location.id} value={location.id.toString()}>
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ke Lokasi</Label>
                                <Select value={formData.to_location_id} onValueChange={v => setFormData({ ...formData, to_location_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih lokasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location.id} value={location.id.toString()}>
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Jumlah</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Catatan</Label>
                            <Textarea
                                placeholder="Catatan tambahan..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.asset_id}
                            className="bg-blue-600 text-white hover:bg-blue-700"
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
                        <DialogTitle className="text-red-500">Hapus Transaksi?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        Transaksi ini akan dihapus secara permanen.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
                        <Button
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="bg-red-500 text-white hover:bg-red-600"
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