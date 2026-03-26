import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import type { Asset } from '@/data/mockAssets';

interface ConditionPieChartProps {
  assets: Asset[];
}

export function ConditionPieChart({ assets }: ConditionPieChartProps) {
  const conditionCounts = assets.reduce((acc, asset) => {
    acc[asset.condition] = (acc[asset.condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conditionColors: Record<string, string> = {
    'Excellent': '#10B981',
    'Good': '#2563EB',
    'Fair': '#F59E0B',
    'Poor': '#EF4444'
  };

  const total = assets.length;
  const conditionData = Object.entries(conditionCounts).map(([condition, count]) => ({
    condition,
    count,
    percentage: (count / total) * 100,
    color: conditionColors[condition]
  }));

  const conditionDataWithOffsets = conditionData.map((item, index) => {
    const offset = conditionData.slice(0, index).reduce((sum, d) => sum + d.percentage, 0);
    return { ...item, offset };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle style={{ color: '#111827' }}>Asset Condition</CardTitle>
          <div className="p-2 rounded-full" style={{ backgroundColor: '#ECFDF5' }}>
            <Activity className="h-4 w-4" style={{ color: '#10B981' }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {conditionDataWithOffsets.map((item) => {
                const circumference = 2 * Math.PI * 30;
                const segmentLength = (item.percentage / 100) * circumference;
                const gapLength = circumference - segmentLength;
                const offset = -(item.offset / 100) * circumference;

                return (
                  <circle
                    key={item.condition}
                    cx="50"
                    cy="50"
                    r="30"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="25"
                    strokeDasharray={`${segmentLength} ${gapLength}`}
                    strokeDashoffset={offset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold" style={{ color: '#111827' }}>{total}</span>
              <span className="text-sm" style={{ color: '#6B7280' }}>Total</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {conditionData.map((item) => (
            <div key={item.condition} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm" style={{ color: '#6B7280' }}>{item.condition}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold w-8 text-right" style={{ color: '#111827' }}>{item.count}</span>
                <span className="text-xs w-14 text-left" style={{ color: '#6B7280' }}>({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

