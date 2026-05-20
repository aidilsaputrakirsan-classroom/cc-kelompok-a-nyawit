#!/bin/sh
set -eu

API_BASE_URL="${FRONTEND_API_BASE_URL:-http://localhost:8000/api/v1}"
PORT="${PORT:-80}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
