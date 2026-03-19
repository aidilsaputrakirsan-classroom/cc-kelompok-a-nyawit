import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Asset } from '@/data/mockAssets';

interface TypeBarChartProps {
  assets: Asset[];
}

export function TypeBarChart({ assets }: TypeBarChartProps) {
  const typeCounts = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(typeCounts)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: '#111827' }}>Asset Distribution by Type</CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-4 md:pb-6 pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#6B7280" fontSize={9} />
            <YAxis stroke="#6B7280" width={40} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
              labelStyle={{ color: '#111827' }}
            />
            <Legend />
            <Bar dataKey="count" fill="#2563EB" name="Asset Count" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

