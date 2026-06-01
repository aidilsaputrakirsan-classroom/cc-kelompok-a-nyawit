#!/bin/sh
set -eu

API_BASE_URL="${FRONTEND_API_BASE_URL:-http://localhost:8000/api/v1}"
PORT="${PORT:-80}"

# Ekstrak origin (scheme + host) dari API_BASE_URL untuk CSP connect-src.
# Contoh: "https://backend-xxxx.railway.app/api/v1" → "https://backend-xxxx.railway.app"
# Ini memungkinkan frontend Railway mengirim request ke backend Railway (beda domain).
BACKEND_ORIGIN=$(echo "$API_BASE_URL" | sed 's|\(https\?://[^/]*\).*|\1|')

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

# Export agar envsubst bisa mengganti $PORT dan $BACKEND_ORIGIN di template
export PORT BACKEND_ORIGIN
envsubst '$PORT $BACKEND_ORIGIN' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
