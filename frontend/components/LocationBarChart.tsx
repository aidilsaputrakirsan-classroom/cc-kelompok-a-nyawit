import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { Asset } from '@/data/mockAssets';

interface LocationBarChartProps {
  assets: Asset[];
}

export function LocationBarChart({ assets }: LocationBarChartProps) {
  const locationCounts = assets.reduce((acc, asset) => {
    acc[asset.location] = (acc[asset.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const maxCount = Math.max(...sortedLocations.map(([, count]) => count));

  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle style={{ color: '#111827' }}>Top Locations</CardTitle>
          <div className="p-2 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
            <MapPin className="h-4 w-4" style={{ color: '#F59E0B' }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedLocations.map(([location, count], index) => {
            const percentage = (count / maxCount) * 100;
            return (
              <div key={location}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#111827' }}>{location}</span>
                  <span className="text-sm font-semibold" style={{ color: colors[index] }}>
                    {count} assets
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: colors[index], width: `${percentage}%` }}
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
