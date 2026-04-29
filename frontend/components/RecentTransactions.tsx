import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { TransactionAPI, AssetAPI, LocationAPI } from '@/lib/api';
import type { Transaction, Asset, Location } from '@/lib/api';

interface EnrichedTransaction extends Transaction {
    assetName: string;
    fromLocationName: string;
    toLocationName: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof ArrowRightLeft }> = {
    'mutasi in': { label: 'Mutasi In', color: '#2563EB', bgColor: '#EFF6FF', icon: ArrowDownLeft },
    'mutasi out': { label: 'Mutasi Out', color: '#7C3AED', bgColor: '#F5F3FF', icon: ArrowUpRight },
    'adjustment in': { label: 'Adj. In', color: '#10B981', bgColor: '#ECFDF5', icon: ArrowDownLeft },
    'adjustment out': { label: 'Adj. Out', color: '#EF4444', bgColor: '#FEF2F2', icon: ArrowUpRight },
    'in': { label: 'Masuk', color: '#10B981', bgColor: '#ECFDF5', icon: ArrowDownLeft },
    'out': { label: 'Keluar', color: '#F59E0B', bgColor: '#FEF3C7', icon: ArrowUpRight },
};

export function RecentTransactions() {
    const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [txData, assetsData, locationsData] = await Promise.allSettled([
                    TransactionAPI.getAll(),
                    AssetAPI.getAll(),
                    LocationAPI.getAll(),
                ]);

                const txs: Transaction[] = txData.status === 'fulfilled' ? txData.value : [];
                const assets: Asset[] = assetsData.status === 'fulfilled' ? assetsData.value : [];
                const locations: Location[] = locationsData.status === 'fulfilled' ? locationsData.value : [];

                const enriched: EnrichedTransaction[] = txs.slice(0, 5).map((tx) => ({
                    ...tx,
                    assetName: assets.find((a) => String(a.id) === String(tx.asset_id))?.name || `Asset #${tx.asset_id}`,
                    fromLocationName: tx.from_location_id
                        ? locations.find((l) => l.id === tx.from_location_id)?.name || '-'
                        : '-',
                    toLocationName: tx.to_location_id
                        ? locations.find((l) => l.id === tx.to_location_id)?.name || '-'
                        : '-',
                }));

                setTransactions(enriched);
            } catch {
                // Silently fail — dashboard should still render
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const fallbackConfig = { label: '?', color: '#6B7280', bgColor: '#F3F4F6', icon: RefreshCw };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#111827' }}>
                    <ArrowRightLeft className="h-5 w-5" style={{ color: '#2563EB' }} />
                    <span>Transaksi Terbaru</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>
                        Memuat transaksi...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <ArrowRightLeft className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm" style={{ color: '#9CA3AF' }}>Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx) => {
                            const config = TYPE_CONFIG[tx.transaction_type] || fallbackConfig;
                            const Icon = config.icon;
                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50"
                                >
                                    <div
                                        className="flex-shrink-0 p-2 rounded-full"
                                        style={{ backgroundColor: config.bgColor }}
                                    >
                                        <Icon className="h-4 w-4" style={{ color: config.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                                            {tx.assetName}
                                        </p>
                                        <p className="text-xs" style={{ color: '#6B7280' }}>
                                            {tx.fromLocationName !== '-' && `${tx.fromLocationName} → `}
                                            {tx.toLocationName !== '-' ? tx.toLocationName : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <span
                                            className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: config.bgColor, color: config.color }}
                                        >
                                            {config.label}
                                        </span>
                                        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                            {new Date(tx.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
