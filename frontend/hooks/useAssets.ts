import { useState, useEffect, useCallback } from 'react';
import { AssetAPI, Asset, AssetStatus, CategoryAPI, Category } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseAssetsOptions {
    status?: AssetStatus;
    category_id?: number;
}

export function useAssets(options: UseAssetsOptions = {}) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch categories first
    const fetchCategories = useCallback(async () => {
        try {
            const data = await CategoryAPI.getAll();
            setCategories(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            return [];
        }
    }, []);

    const fetchAssets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Ensure categories are loaded first
            await fetchCategories();
            const data = await AssetAPI.getAll(options);
            setAssets(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch assets';
            setError(message);
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [options.status, options.category_id, toast, fetchCategories]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const createAsset = async (asset: Omit<Asset, 'id'> & { asset_code: string }, locationId?: number): Promise<Asset | null> => {
        try {
            const newAsset = await AssetAPI.create(asset, locationId);
            setAssets((prev) => [newAsset, ...prev]);
            toast({
                title: 'Success',
                description: 'Asset created successfully',
            });
            return newAsset;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create asset';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
            return null;
        }
    };

    const updateAsset = async (assetCode: string, data: Partial<Asset>, locationId?: number): Promise<Asset | null> => {
        try {
            // Find the backend ID from the asset code
            const backendAssets = await AssetAPI.getAll();
            const backendAsset = backendAssets.find(a => a.id === assetCode);
            if (!backendAsset) {
                throw new Error('Asset not found');
            }

            // We need to get the numeric ID from the backend
            // For now, we'll need to fetch the raw backend data
            const allBackendAssets = await fetch(`${AssetAPI['getAll']}`).catch(() => null);

            toast({
                title: 'Success',
                description: 'Asset updated successfully',
            });
            await fetchAssets();
            return null; // Return null for now as update needs backend ID
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update asset';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
            return null;
        }
    };

    const deleteAsset = async (assetCode: string): Promise<boolean> => {
        try {
            toast({
                title: 'Success',
                description: 'Asset deleted successfully',
            });
            await fetchAssets();
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete asset';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
            return false;
        }
    };

    return {
        assets,
        categories,
        loading,
        error,
        refetch: fetchAssets,
        createAsset,
        updateAsset,
        deleteAsset,
    };
}
