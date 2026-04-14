// API Service for connecting frontend to backend
// Use relative paths - Vite proxy handles CORS
export const API_BASE_URL = '/api/v1';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
    const session = localStorage.getItem('asset-manager-session');
    if (!session) return null;
    try {
        const parsed = JSON.parse(session);
        return parsed.access_token || null;
    } catch {
        return null;
    }
}

// Generic fetch wrapper with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`API Request: ${options.method || 'GET'} ${API_BASE_URL}${url}`);

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

// Types matching backend schema
export type AssetStatus = 'In Use' | 'Available' | 'Under Maintenance' | 'Retired';
export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type AssetCategory = 'Hardware' | 'Software' | 'Peripherals';

export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: number;
    name: string;
    address: string | null;
    created_at: string;
    updated_at: string;
}

// Frontend Asset interface (matches mockAssets.ts)
export interface Asset {
    id: string;  // numeric ID for API calls
    asset_code: string;  // display code
    name: string;
    type: string;
    category: AssetCategory;
    location: string;
    status: AssetStatus;
    assignedTo: string;
    purchaseDate: string;
    lastUpdate: string;
    condition: AssetCondition;
}

// Backend Asset interface
export interface BackendAsset {
    id: number;
    asset_code: string;
    name: string;
    type: string;
    category_id: number;
    location: string | null;
    location_id: number | null;
    status: string;
    assigned_to: string | null;
    purchase_date: string | null;
    last_update: string | null;
    condition: string;
    serial_number: string | null;
    brand: string | null;
    model: string | null;
    specs: string | null;
    ip_address: string | null;
    mac_address: string | null;
    created_at: string;
    updated_at: string;
    category: Category | null;
    location_ref: Location | null;
}

export interface AssetCreate {
    asset_code: string;
    name: string;
    type: string;
    category_id: number;
    location?: string;
    location_id?: number;
    status?: AssetStatus;
    assigned_to?: string;
    purchase_date?: string;
    last_update?: string;
    condition?: AssetCondition;
    serial_number?: string;
    brand?: string;
    model?: string;
    specs?: string;
    ip_address?: string;
    mac_address?: string;
}

export interface AssetUpdate {
    asset_code?: string;
    name?: string;
    type?: string;
    category_id?: number;
    location?: string;
    location_id?: number;
    status?: AssetStatus;
    assigned_to?: string;
    purchase_date?: string;
    last_update?: string;
    condition?: AssetCondition;
    serial_number?: string;
    brand?: string;
    model?: string;
    specs?: string;
    ip_address?: string;
    mac_address?: string;
}

// Map backend asset to frontend asset
function mapBackendToFrontend(asset: BackendAsset): Asset {
    // Map category_id to category name
    const categoryMap: Record<number, AssetCategory> = {
        1: 'Hardware',
        2: 'Software',
        3: 'Peripherals',
    };

    // Helper to normalize status from database (e.g., 'AVAILABLE' -> 'Available')
    const normalizeStatus = (status: string): AssetStatus => {
        const s = status.toLowerCase();
        if (s === 'available') return 'Available';
        if (s === 'in use') return 'In Use';
        if (s === 'under maintenance') return 'Under Maintenance';
        if (s === 'retired') return 'Retired';
        return 'Available' as AssetStatus;
    };

    // Helper to normalize condition (e.g., 'GOOD' -> 'Good')
    const normalizeCondition = (cond: string): AssetCondition => {
        const c = cond.toLowerCase();
        if (c === 'excellent') return 'Excellent';
        if (c === 'good') return 'Good';
        if (c === 'fair') return 'Fair';
        if (c === 'poor') return 'Poor';
        return 'Good' as AssetCondition;
    };

    return {
        id: asset.id.toString(),  // Use numeric ID for API calls
        asset_code: asset.asset_code,  // Keep asset_code for display
        name: asset.name,
        type: asset.type,
        category: categoryMap[asset.category_id] || 'Hardware',
        location: asset.location || asset.location_ref?.name || 'Unknown',
        status: normalizeStatus(asset.status),
        assignedTo: asset.assigned_to || 'Unassigned',
        purchaseDate: asset.purchase_date || asset.created_at.split('T')[0],
        lastUpdate: asset.last_update || asset.updated_at.split('T')[0],
        condition: normalizeCondition(asset.condition),
    };
}

// Map frontend asset to backend asset create
function mapFrontendToCreate(asset: Omit<Asset, 'id'> & { asset_code: string }, categoryId: number, locationId?: number): AssetCreate {
    return {
        asset_code: asset.asset_code,
        name: asset.name,
        type: asset.type,
        category_id: categoryId,
        location: asset.location,
        location_id: locationId,
        status: asset.status,
        assigned_to: asset.assignedTo === 'Unassigned' ? undefined : asset.assignedTo,
        purchase_date: asset.purchaseDate,
        last_update: asset.lastUpdate,
        condition: asset.condition,
    };
}

// Get category ID from name
function getCategoryId(category: AssetCategory): number {
    const map: Record<AssetCategory, number> = {
        'Hardware': 1,
        'Software': 2,
        'Peripherals': 3,
    };
    return map[category];
}

// Asset API
export const AssetAPI = {
    // Get all assets (returns frontend-formatted assets)
    getAll: async (filters?: { status?: AssetStatus; category_id?: number }): Promise<Asset[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.category_id) params.append('category_id', filters.category_id.toString());
        const query = params.toString() ? `?${params.toString()}` : '';
        const backendAssets: BackendAsset[] = await fetchWithAuth(`/assets${query}`);
        return backendAssets.map(mapBackendToFrontend);
    },

    // Get single asset
    getById: async (id: number): Promise<Asset> => {
        const backendAsset: BackendAsset = await fetchWithAuth(`/assets/${id}`);
        return mapBackendToFrontend(backendAsset);
    },

    // Create asset
    create: async (asset: Omit<Asset, 'id'> & { asset_code: string }, locationId?: number): Promise<Asset> => {
        const categoryId = getCategoryId(asset.category);
        const data = mapFrontendToCreate(asset, categoryId, locationId);
        const backendAsset: BackendAsset = await fetchWithAuth('/assets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return mapBackendToFrontend(backendAsset);
    },

    // Update asset
    update: async (asset: Partial<Asset> & { id: string }, locationId?: number): Promise<Asset> => {
        const numericId = parseInt(asset.id, 10);
        const updateData: AssetUpdate = {};
        if (asset.name) updateData.name = asset.name;
        if (asset.type) updateData.type = asset.type;
        if (asset.category) updateData.category_id = getCategoryId(asset.category);
        if (asset.location) updateData.location = asset.location;
        if (locationId !== undefined) updateData.location_id = locationId;
        if (asset.status) updateData.status = asset.status;
        if (asset.assignedTo !== undefined) updateData.assigned_to = asset.assignedTo === 'Unassigned' ? undefined : asset.assignedTo;
        if (asset.purchaseDate) updateData.purchase_date = asset.purchaseDate;
        if (asset.lastUpdate) updateData.last_update = asset.lastUpdate;
        if (asset.condition) updateData.condition = asset.condition;

        const backendAsset: BackendAsset = await fetchWithAuth(`/assets/${numericId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return mapBackendToFrontend(backendAsset);
    },

    // Delete asset
    delete: async (id: string): Promise<void> => {
        const numericId = parseInt(id, 10);
        return fetchWithAuth(`/assets/${numericId}`, {
            method: 'DELETE',
        });
    },
};

// Category API
export const CategoryAPI = {
    getAll: (): Promise<Category[]> => {
        return fetchWithAuth('/categories');
    },

    getById: (id: number): Promise<Category> => {
        return fetchWithAuth(`/categories/${id}`);
    },

    create: (data: { name: string; description?: string }): Promise<Category> => {
        return fetchWithAuth('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: (id: number, data: { name?: string; description?: string }): Promise<Category> => {
        return fetchWithAuth(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: (id: number): Promise<void> => {
        return fetchWithAuth(`/categories/${id}`, {
            method: 'DELETE',
        });
    },
};

// Location API
export const LocationAPI = {
    getAll: (): Promise<Location[]> => {
        return fetchWithAuth('/locations');
    },

    getById: (id: number): Promise<Location> => {
        return fetchWithAuth(`/locations/${id}`);
    },

    create: (data: { name: string; address?: string }): Promise<Location> => {
        return fetchWithAuth('/locations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: (id: number, data: { name?: string; address?: string }): Promise<Location> => {
        return fetchWithAuth(`/locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: (id: number): Promise<void> => {
        return fetchWithAuth(`/locations/${id}`, {
            method: 'DELETE',
        });
    },
};

// Auth API
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
}

export const AuthAPI = {
    login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        // Store token in session
        const session = {
            access_token: data.access_token,
            user: data.user || { email: credentials.username, name: credentials.username, role: 'user' },
            loginTime: Date.now(),
            lastActivity: Date.now(),
        };
        localStorage.setItem('asset-manager-session', JSON.stringify(session));
        return data;
    },

    getCurrentUser: (): Promise<User> => {
        return fetchWithAuth('/auth/me');
    },

    logout: (): void => {
        localStorage.removeItem('asset-manager-session');
    },
};
