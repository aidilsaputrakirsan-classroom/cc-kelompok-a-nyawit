import { Card, CardContent } from '@/components/ui/card';
import { Package, CheckCircle, Archive } from 'lucide-react';
import type { Asset } from '@/data/mockAssets';

interface MetricCardsProps {
  assets: Asset[];
}

export function MetricCards({ assets }: MetricCardsProps) {
  const totalAssets = assets.length;
  const assetsInUse = assets.filter(asset => asset.status === 'In Use').length;
  const assetsRetired = assets.filter(asset => asset.status === 'Retired').length;

  const metrics = [
    {
      title: 'Total Assets',
      value: totalAssets,
      icon: Package,
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    {
      title: 'Assets In Use',
      value: assetsInUse,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: '#ECFDF5'
    },
    {
      title: 'Retired',
      value: assetsRetired,
      icon: Archive,
      color: '#6B7280',
      bgColor: '#F3F4F6'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium" style={{ color: '#6B7280' }}>{metric.title}</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2" style={{ color: '#111827' }}>{metric.value}</h3>
                </div>
                <div className="p-2 md:p-3 rounded-full" style={{ backgroundColor: metric.bgColor }}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: metric.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
