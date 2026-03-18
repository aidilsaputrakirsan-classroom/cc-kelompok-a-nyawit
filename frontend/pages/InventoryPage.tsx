import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockAssets } from '@/data/mockAssets';
import { MetricCards } from '@/components/MetricCards';
import { StatusPieChart } from '@/components/StatusPieChart';
import { TypeBarChart } from '@/components/TypeBarChart';
import { AssetTable } from '@/components/AssetTable';
import { CategoryTabs } from '@/components/CategoryTabs';
import { Toaster } from '@/components/ui/toaster';

import type { AssetCategory, Asset } from '@/data/mockAssets';

export function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [allAssets, setAllAssets] = useState<Asset[]>(mockAssets);

  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'All') {
      return allAssets;
    }
    return allAssets.filter(asset => asset.category === selectedCategory);
  }, [selectedCategory, allAssets]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All': allAssets.length,
      'Hardware': 0,
      'Software': 0,
      'Peripherals': 0
    };
    
    allAssets.forEach(asset => {
      counts[asset.category]++;
    });
    
    return counts;
  }, [allAssets]);

  const handleAddAsset = (newAsset: Asset) => {
    setAllAssets([newAsset, ...allAssets]);
  };

  const handleEditAsset = (updatedAssets: Asset[]) => {
    setAllAssets(updatedAssets);
  };

  return (
    <>
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Inventory</h1>
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
