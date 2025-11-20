# Employee Management System - Startup Script
# This script starts both the .NET API and the Next.js frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Employee Management System - Startup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path ".\EmployeeMvp.csproj")) {
    Write-Host "[ERROR] Please run this script from the EMS directory" -ForegroundColor Red
    exit 1
}

# Start .NET API in a new window
Write-Host "[1/2] Starting .NET API Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🚀 Starting API Server on http://localhost:5000' -ForegroundColor Green; dotnet run --project EmployeeMvp.csproj --urls http://localhost:5000" -WindowStyle Normal

# Wait for API to start
Write-Host "  Waiting for API to initialize (8 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Start Next.js Frontend in a new window
Write-Host "[2/2] Starting Next.js Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '🌐 Starting Frontend on http://localhost:3002' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ Both servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API:      http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3002" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Press any key to run API tests..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Run tests
Write-Host "`nRunning API Tests..." -ForegroundColor Cyan
.\test-api.ps1

Write-Host "`n✅ Startup complete! Both servers are running." -ForegroundColor Green
Write-Host "Close this window or press Ctrl+C to exit (servers will continue running)" -ForegroundColor Gray
