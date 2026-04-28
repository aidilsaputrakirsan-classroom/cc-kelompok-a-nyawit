import { useState, useEffect, useCallback } from 'react';
import { AssetAPI, Asset, AssetStatus, CategoryAPI, Category } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseAssetsOptions {
    status?: AssetStatus;
    category_id?: number;
}

export function useAssets(options: UseAssetsOptions = {}, realtime: boolean = false) {
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

    const fetchAssets = useCallback(async (silent: boolean = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            setError(null);
            // Ensure categories are loaded first
            await fetchCategories();
            console.log('Fetching assets from API...');
            const data = await AssetAPI.getAll(options);
            console.log('Assets fetched:', data.length);
            setAssets(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch assets';
            console.error('Error fetching assets:', err);
            setError(message);
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [options.status, options.category_id, toast, fetchCategories]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    // Add real-time polling if enabled
    useEffect(() => {
        if (!realtime) return;

        const interval = setInterval(() => {
            fetchAssets(true);
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [realtime, fetchAssets]);

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

    const updateAsset = async (assetId: string, data: Partial<Asset>, locationId?: number): Promise<Asset | null> => {
        try {
            const updatedAsset = await AssetAPI.update({ ...data, id: assetId }, locationId);
            setAssets((prev) => prev.map(a => a.id === assetId ? updatedAsset : a));
            toast({
                title: 'Success',
                description: 'Asset updated successfully',
            });
            return updatedAsset;
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

    const deleteAsset = async (assetId: string): Promise<boolean> => {
        try {
            await AssetAPI.delete(assetId);
            setAssets((prev) => prev.filter(a => a.id !== assetId));
            toast({
                title: 'Success',
                description: 'Asset deleted successfully',
            });
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
