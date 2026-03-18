import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import type { Asset } from '@/data/mockAssets';

interface MaintenanceStatusChartProps {
  assets: Asset[];
}

export function MaintenanceStatusChart({ assets }: MaintenanceStatusChartProps) {
  const maintenanceAssets = assets.filter(asset => asset.status === 'Under Maintenance');
  const inUseAssets = assets.filter(asset => asset.status === 'In Use');
  const availableAssets = assets.filter(asset => asset.status === 'Available');
  const retiredAssets = assets.filter(asset => asset.status === 'Retired');

  const stats = [
    {
      label: 'Under Maintenance',
      count: maintenanceAssets.length,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      label: 'In Use',
      count: inUseAssets.length,
      color: '#10B981',
      bgColor: '#ECFDF5'
    },
    {
      label: 'Available',
      count: availableAssets.length,
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    {
      label: 'Retired',
      count: retiredAssets.length,
      color: '#6B7280',
      bgColor: '#F3F4F6'
    }
  ];

  const maintenanceRate = ((maintenanceAssets.length / assets.length) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle style={{ color: '#111827' }}>Maintenance Overview</CardTitle>
          <div className="p-2 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
            <Wrench className="h-4 w-4" style={{ color: '#F59E0B' }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
          <div className="text-center">
            <span className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{maintenanceRate}%</span>
            <p className="text-sm mt-1" style={{ color: '#92400E' }}>Current Maintenance Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg" style={{ backgroundColor: stat.bgColor }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
