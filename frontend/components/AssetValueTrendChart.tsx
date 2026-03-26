import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { Asset } from '@/data/mockAssets';

interface AssetValueTrendChartProps {
  assets: Asset[];
}

export function AssetValueTrendChart({ assets }: AssetValueTrendChartProps) {
  const monthlyData = assets.reduce((acc, asset) => {
    const month = new Date(asset.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += asset.value;
    return acc;
  }, {} as Record<string, number>);

  const sortedEntries = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6);

  const maxValue = Math.max(...sortedEntries.map(([, value]) => value));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle style={{ color: '#111827' }}>Asset Value Trends</CardTitle>
          <div className="p-2 rounded-full" style={{ backgroundColor: '#EFF6FF' }}>
            <TrendingUp className="h-4 w-4" style={{ color: '#2563EB' }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEntries.map(([month, value]) => {
            const percentage = (value / maxValue) * 100;
            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>{month}</span>
                  <span className="text-sm font-semibold" style={{ color: '#2563EB' }}>
                    ${value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: '#2563EB', width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
