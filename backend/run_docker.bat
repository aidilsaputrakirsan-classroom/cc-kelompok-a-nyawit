@echo off
cd /d d:\Ilham\cc-kelompok-a-nyawit\backend
echo Stopping existing containers...
docker compose down
echo.
echo Building and starting containers...
docker compose up -d --build
echo.
echo Waiting for containers to initialize...
timeout /t 5 /nobreak
echo.
echo Container status:
docker compose ps
echo.
echo API logs:
docker compose logs api --tail=20

