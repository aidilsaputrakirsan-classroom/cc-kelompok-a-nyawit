import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { AssetValueTrendChart } from '@/components/AssetValueTrendChart';
import { ConditionPieChart } from '@/components/ConditionPieChart';
import { LocationBarChart } from '@/components/LocationBarChart';
import { MaintenanceStatusChart } from '@/components/MaintenanceStatusChart';
import { mockAssets } from '@/data/mockAssets';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Analytics</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
          Comprehensive insights and data visualization
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Utilization Rate', value: '78%', change: '+5.2%', icon: Activity, color: '#10B981', bgColor: '#ECFDF5' },
          { label: 'Active Assets', value: '84', change: '+12', icon: TrendingUp, color: '#2563EB', bgColor: '#EFF6FF' },
          { label: 'Categories', value: '3', change: '0', icon: PieChart, color: '#F59E0B', bgColor: '#FEF3C7' },
          { label: 'Growth Rate', value: '12%', change: '+2.1%', icon: BarChart3, color: '#6B7280', bgColor: '#F3F4F6' }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{stat.label}</p>
                  <div className="p-2 rounded-full" style={{ backgroundColor: stat.bgColor }}>
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#111827' }}>{stat.value}</h3>
                <p className="text-xs mt-1" style={{ color: stat.change.startsWith('+') ? '#10B981' : '#EF4444' }}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <AssetValueTrendChart assets={mockAssets} />
        <MaintenanceStatusChart assets={mockAssets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ConditionPieChart assets={mockAssets} />
        <LocationBarChart assets={mockAssets} />
      </div>
    </div>
  );
}

