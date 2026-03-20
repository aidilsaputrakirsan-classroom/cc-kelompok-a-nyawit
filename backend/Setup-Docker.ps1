#!/usr/bin/env pwsh

$ErrorActionPreference = "Continue"
$backendPath = "d:\Ilham\cc-kelompok-a-nyawit\backend"
Set-Location $backendPath

Write-Host "=== Docker Compose Setup ===" -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray

# Clean up existing containers
Write-Host "`n1. Cleaning up existing containers..." -ForegroundColor Yellow
& docker compose down 2>&1 | Tee-Object -Variable downOutput | Out-String | Write-Host

# Build and start containers
Write-Host "`n2. Building and starting containers..." -ForegroundColor Yellow
$startTime = Get-Date
& docker compose up -d --build 2>&1 | Tee-Object -Variable upOutput | Out-String | Write-Host
$upExitCode = $LASTEXITCODE
Write-Host "Docker compose exit code: $upExitCode" -ForegroundColor Gray

# Give containers a moment to Start
Start-Sleep -Seconds 3

# Check container status
Write-Host "`n3. Checking container status..." -ForegroundColor Yellow
& docker compose ps 2>&1 | Tee-Object -Variable psOutput | Out-String | Write-Host

# Check container logs
Write-Host "`n4. Container logs (last 30 lines)..." -ForegroundColor Yellow
foreach ($service in @('api', 'postgres', 'pgadmin')) {
    Write-Host "`n--- $service logs ---" -ForegroundColor Cyan
    & docker compose logs --tail=30 $service 2>&1 | Out-String | Write-Host
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Setup duration: $((Get-Date) - $startTime).TotalSeconds seconds"
Write-Host "Docker Compose up exit code: $upExitCode"

if ($upExitCode -eq 0) {
    Write-Host "`n[OK] Docker compose started successfully" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Docker compose had issues (exit code: $upExitCode)" -ForegroundColor Red
}
