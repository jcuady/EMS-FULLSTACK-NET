Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REDIS SETUP FOR EMS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "`nPlease:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop from Start Menu" -ForegroundColor White
    Write-Host "2. Wait for it to fully start (whale icon in system tray)" -ForegroundColor White
    Write-Host "3. Run this script again`n" -ForegroundColor White
    exit 1
}

# Check if Redis container already exists
Write-Host "`nStep 2: Checking for existing Redis container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=ems-redis" --format "{{.Names}}"

if ($existingContainer -eq "ems-redis") {
    Write-Host "Found existing Redis container: $existingContainer" -ForegroundColor Cyan
    
    # Check if it's running
    $isRunning = docker ps --filter "name=ems-redis" --format "{{.Names}}"
    
    if ($isRunning -eq "ems-redis") {
        Write-Host "✅ Redis is already running!" -ForegroundColor Green
    } else {
        Write-Host "Starting existing Redis container..." -ForegroundColor Yellow
        docker start ems-redis
        Write-Host "✅ Redis started!" -ForegroundColor Green
    }
} else {
    # Pull and run new Redis container
    Write-Host "Pulling Redis image (this may take a minute)..." -ForegroundColor Yellow
    docker pull redis:latest
    
    Write-Host "`nStep 3: Creating and starting Redis container..." -ForegroundColor Yellow
    docker run -d -p 6379:6379 --name ems-redis redis:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis container created and started!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create Redis container" -ForegroundColor Red
        exit 1
    }
}

# Verify Redis is accessible
Write-Host "`nStep 4: Verifying Redis connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $connection = Test-NetConnection localhost -Port 6379 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Redis is accessible on port 6379!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Redis container is running but port not accessible yet" -ForegroundColor Yellow
        Write-Host "   Give it a few more seconds..." -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Could not verify port connection" -ForegroundColor Yellow
}

# Show container status
Write-Host "`nStep 5: Redis Container Status:" -ForegroundColor Yellow
docker ps --filter "name=ems-redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  REDIS SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your .NET API (it will auto-detect Redis)" -ForegroundColor White
Write-Host "2. Watch the console logs for cache activity!" -ForegroundColor White
Write-Host "3. Check for these log messages:" -ForegroundColor White
Write-Host "   - ✅ Cache HIT (Memory/Redis)" -ForegroundColor Gray
Write-Host "   - ❌ Cache MISS" -ForegroundColor Gray
Write-Host "   - 💾 Cache SET" -ForegroundColor Gray

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  docker ps                  # Check if Redis is running" -ForegroundColor Gray
Write-Host "  docker stop ems-redis      # Stop Redis" -ForegroundColor Gray
Write-Host "  docker start ems-redis     # Start Redis" -ForegroundColor Gray
Write-Host "  docker logs ems-redis      # View Redis logs" -ForegroundColor Gray
Write-Host "  docker rm -f ems-redis     # Remove Redis container`n" -ForegroundColor Gray
