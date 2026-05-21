// Runtime configuration — reads values injected by docker-entrypoint.sh
// via window.__APP_CONFIG__ (loaded from /config.js in index.html).
// Falls back to '/api' for local development (proxied by Vite dev server).

interface AppConfig {
  API_BASE_URL: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

export function getApiBaseUrl(): string {
  return window.__APP_CONFIG__?.API_BASE_URL ?? '/api';
}
