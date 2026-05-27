export interface AppRuntimeConfig {
    API_BASE_URL?: string;
}

declare global {
    interface Window {
        __APP_CONFIG__?: AppRuntimeConfig;
    }
}

export function getRuntimeConfig(): AppRuntimeConfig {
    if (typeof window !== 'undefined') {
        return window.__APP_CONFIG__ ?? {};
    }
    return {};
}

export function getApiBaseUrl(): string {
    const runtimeBaseUrl = getRuntimeConfig().API_BASE_URL?.trim();
    const baseUrl = runtimeBaseUrl && runtimeBaseUrl.length > 0 ? runtimeBaseUrl : '/api/v1';

    return baseUrl.replace(/\/$/, '');
}
