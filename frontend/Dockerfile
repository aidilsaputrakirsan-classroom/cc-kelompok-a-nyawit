# syntax=docker/dockerfile:1.4

FROM oven/bun:1 AS frontend-builder

WORKDIR /app/frontend

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY ./ ./
RUN bun run build

FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache gettext curl

COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
