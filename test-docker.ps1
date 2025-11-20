# Docker Full Test Script
# Builds, runs, and tests the complete system in Docker containers

param(
    [switch]$Clean,
    [switch]$SkipBuild,
    [switch]$Logs
)

$ErrorActionPreference = "Continue"
$ComposeFile = "docker-compose.yml"
$TestWaitTime = 60  # seconds to wait for services to be ready

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Gray = "Gray"

Write-Host "`n================================================================" -ForegroundColor $Cyan
Write-Host "     DOCKER FULL SYSTEM TEST" -ForegroundColor $Cyan
Write-Host "================================================================`n" -ForegroundColor $Cyan

# Check if Docker is installed and running
Write-Host "Checking Docker installation..." -NoNewline
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor $Green
        Write-Host "  $dockerVersion" -ForegroundColor $Gray
    } else {
        throw "Docker not found"
    }
}
catch {
    Write-Host " FAILED" -ForegroundColor $Red
    Write-Host "ERROR: Docker is not installed or not running" -ForegroundColor $Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor $Yellow
    exit 1
}

Write-Host "Checking Docker Compose..." -NoNewline
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor $Green
        Write-Host "  $composeVersion" -ForegroundColor $Gray
    } else {
        throw "Docker Compose not found"
    }
}
catch {
    Write-Host " FAILED" -ForegroundColor $Red
    Write-Host "ERROR: Docker Compose is not available" -ForegroundColor $Red
    exit 1
}

# Clean previous containers if requested
if ($Clean) {
    Write-Host "`nCleaning previous containers and volumes..." -ForegroundColor $Yellow
    docker compose down -v 2>&1 | Out-Null
    Write-Host "Clean complete" -ForegroundColor $Green
}

# Stop any running containers
Write-Host "`nStopping existing containers..." -ForegroundColor $Yellow
docker compose down 2>&1 | Out-Null

# Build images
if (-not $SkipBuild) {
    Write-Host "`nBuilding Docker images..." -ForegroundColor $Yellow
    Write-Host "This may take 5-10 minutes on first run..." -ForegroundColor $Gray
    
    $buildStart = Get-Date
    docker compose build --no-cache 2>&1 | ForEach-Object {
        if ($_ -match "ERROR|failed") {
            Write-Host $_ -ForegroundColor $Red
        } elseif ($_ -match "Step \d+/\d+") {
            Write-Host $_ -ForegroundColor $Cyan
        }
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nBuild FAILED" -ForegroundColor $Red
        exit 1
    }
    
    $buildTime = ((Get-Date) - $buildStart).TotalSeconds
    Write-Host "Build completed in $([math]::Round($buildTime, 1)) seconds" -ForegroundColor $Green
} else {
    Write-Host "`nSkipping build (using existing images)..." -ForegroundColor $Yellow
}

# Start services
Write-Host "`nStarting all services..." -ForegroundColor $Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start services" -ForegroundColor $Red
    exit 1
}

Write-Host "Services started" -ForegroundColor $Green

# Wait for services to be healthy
Write-Host "`nWaiting for services to be ready..." -ForegroundColor $Yellow
$maxWait = $TestWaitTime
$waited = 0
$interval = 5

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds $interval
    $waited += $interval
    
    # Check health status
    $healthStatus = docker compose ps --format json | ConvertFrom-Json
    $allHealthy = $true
    
    foreach ($service in $healthStatus) {
        $status = $service.Health
        if ($status -and $status -ne "healthy") {
            $allHealthy = $false
            break
        }
    }
    
    if ($allHealthy) {
        Write-Host "All services are healthy!" -ForegroundColor $Green
        break
    }
    
    Write-Host "  Waiting... ($waited/$maxWait seconds)" -ForegroundColor $Gray
}

if ($waited -ge $maxWait) {
    Write-Host "WARNING: Timeout waiting for services" -ForegroundColor $Yellow
    Write-Host "Continuing with tests anyway..." -ForegroundColor $Gray
}

# Show service status
Write-Host "`nService Status:" -ForegroundColor $Yellow
docker compose ps

# Test backend health
Write-Host "`nTesting Backend API..." -ForegroundColor $Yellow
Start-Sleep -Seconds 5  # Extra wait for API warmup

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 10
    Write-Host "  [OK] Backend health check passed" -ForegroundColor $Green
    Write-Host "  Status: $($response.status)" -ForegroundColor $Gray
}
catch {
    Write-Host "  [FAIL] Backend not responding" -ForegroundColor $Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $Yellow
}

# Test frontend
Write-Host "`nTesting Frontend..." -ForegroundColor $Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  [OK] Frontend is accessible" -ForegroundColor $Green
    }
}
catch {
    Write-Host "  [FAIL] Frontend not responding" -ForegroundColor $Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $Yellow
}

# Run automated API tests
Write-Host "`n================================================================" -ForegroundColor $Cyan
Write-Host "     RUNNING AUTOMATED API TESTS" -ForegroundColor $Cyan
Write-Host "================================================================`n" -ForegroundColor $Cyan

# Check if test script exists
if (Test-Path ".\run-complete-tests.ps1") {
    Write-Host "Executing test suite against Docker containers...`n" -ForegroundColor $Yellow
    
    # Run the test script
    & ".\run-complete-tests.ps1"
    $testExitCode = $LASTEXITCODE
    
    if ($testExitCode -eq 0) {
        Write-Host "`nAll API tests PASSED!" -ForegroundColor $Green
    } else {
        Write-Host "`nSome API tests FAILED" -ForegroundColor $Yellow
    }
} else {
    Write-Host "Test script not found (run-complete-tests.ps1)" -ForegroundColor $Yellow
    Write-Host "Skipping automated tests" -ForegroundColor $Gray
}

# Show logs if requested
if ($Logs) {
    Write-Host "`n================================================================" -ForegroundColor $Cyan
    Write-Host "     CONTAINER LOGS" -ForegroundColor $Cyan
    Write-Host "================================================================`n" -ForegroundColor $Cyan
    
    Write-Host "`nBackend Logs (last 50 lines):" -ForegroundColor $Yellow
    docker compose logs --tail=50 backend
    
    Write-Host "`nFrontend Logs (last 50 lines):" -ForegroundColor $Yellow
    docker compose logs --tail=50 frontend
}

# Final summary
Write-Host "`n================================================================" -ForegroundColor $Cyan
Write-Host "     DOCKER TEST SUMMARY" -ForegroundColor $Cyan
Write-Host "================================================================`n" -ForegroundColor $Cyan

Write-Host "Services Running:" -ForegroundColor $White
Write-Host "  - PostgreSQL:  localhost:5432" -ForegroundColor $Gray
Write-Host "  - Redis:       localhost:6379" -ForegroundColor $Gray
Write-Host "  - Backend API: http://localhost:5000" -ForegroundColor $Gray
Write-Host "  - Frontend UI: http://localhost:3000" -ForegroundColor $Gray

Write-Host "`nUseful Commands:" -ForegroundColor $White
Write-Host "  View logs:        docker compose logs -f" -ForegroundColor $Gray
Write-Host "  View status:      docker compose ps" -ForegroundColor $Gray
Write-Host "  Stop services:    docker compose down" -ForegroundColor $Gray
Write-Host "  Restart service:  docker compose restart <service>" -ForegroundColor $Gray
Write-Host "  Clean all:        docker compose down -v" -ForegroundColor $Gray

Write-Host "`nOpen in browser:  http://localhost:3000" -ForegroundColor $Cyan
Write-Host "Login:            admin@test.com / Admin@123" -ForegroundColor $Gray

Write-Host "`nPress Enter to stop all services, or Ctrl+C to leave them running..." -ForegroundColor $Yellow
$null = Read-Host

Write-Host "`nStopping services..." -ForegroundColor $Yellow
docker compose down

Write-Host "All services stopped" -ForegroundColor $Green
Write-Host ""
