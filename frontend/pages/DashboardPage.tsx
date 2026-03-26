import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCards } from '@/components/MetricCards';
import { StatusPieChart } from '@/components/StatusPieChart';
import { TypeBarChart } from '@/components/TypeBarChart';
import { AssetTable } from '@/components/AssetTable';
import { CategoryTabs } from '@/components/CategoryTabs';
import { Toaster } from '@/components/ui/toaster';
import { useAssets } from '@/hooks/useAssets';
import type { Asset, AssetCategory } from '@/data/mockAssets';

export function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const { assets, loading, error, refetch } = useAssets();

  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'All') {
      return assets;
    }
    return assets.filter((asset: Asset) => asset.category === selectedCategory);
  }, [selectedCategory, assets]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All': assets.length,
      'Hardware': 0,
      'Software': 0,
      'Peripherals': 0
    };
    
    assets.forEach((asset: Asset) => {
      counts[asset.category]++;
    });
    
    return counts;
  }, [assets]);

  const handleAddAsset = () => {
    // Refresh the assets list after adding
    refetch();
  };

  const handleEditAsset = () => {
    // Refresh the assets list after editing
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Dashboard</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
          Manage and track all assets in your organization
        </p>
      </div>
      
      <CategoryTabs 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Overview</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <MetricCards assets={filteredAssets} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <StatusPieChart assets={filteredAssets} />
          <TypeBarChart assets={filteredAssets} />
        </div>

        <AssetTable 
          assets={filteredAssets} 
          onAssetsChange={handleAddAsset}
          onEditAsset={handleEditAsset}
        />
      </div>
      <Toaster />
    </>
  );
}
