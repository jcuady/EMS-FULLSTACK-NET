# ============================================================
# EMS COMPLETE STARTUP SCRIPT
# Starts Backend, Frontend, and Docker services
# ============================================================

param(
    [ValidateSet("all", "docker", "local", "backend-only", "frontend-only")]
    [string]$Mode = "all",
    
    [switch]$NoBuild,
    [switch]$CleanStart,
    [switch]$Logs,
    [int]$WaitSeconds = 30
)

# Color functions
function Write-Header { param($Title) Write-Host "`n=== $Title ===" -ForegroundColor Cyan -BackgroundColor DarkBlue }
function Write-Success { param($Msg) Write-Host "✅ $Msg" -ForegroundColor Green }
function Write-Info { param($Msg) Write-Host "ℹ️  $Msg" -ForegroundColor Cyan }
function Write-Warning { param($Msg) Write-Host "⚠️  $Msg" -ForegroundColor Yellow }
function Write-Error { param($Msg) Write-Host "❌ $Msg" -ForegroundColor Red }
function Write-Step { param($Msg) Write-Host "🔄 $Msg" -ForegroundColor Magenta }

Write-Host @"

 ███████╗███╗   ███╗███████╗    ███████╗████████╗ █████╗ ██████╗ ████████╗
 ██╔════╝████╗ ████║██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
 █████╗  ██╔████╔██║███████╗    ███████╗   ██║   ███████║██████╔╝   ██║   
 ██╔══╝  ██║╚██╔╝██║╚════██║    ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   
 ███████╗██║ ╚═╝ ██║███████║    ███████║   ██║   ██║  ██║██║  ██║   ██║   
 ╚══════╝╚═╝     ╚═╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
                                                                           
 Employee Management System - Complete Startup Script
 ====================================================================

"@ -ForegroundColor Cyan

Write-Info "Startup Configuration:"
Write-Info "  Mode: $Mode"
Write-Info "  Clean Start: $CleanStart" 
Write-Info "  No Build: $NoBuild"
Write-Info "  Show Logs: $Logs"
Write-Info "  Wait Time: $WaitSeconds seconds"
Write-Host ""

# Helper Functions
function Test-ServiceRunning {
    param([string]$ServiceName, [string]$Url, [int]$Timeout = 5)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $Timeout -ErrorAction Stop
        Write-Success "$ServiceName is already running at $Url"
        return $true
    }
    catch {
        Write-Info "$ServiceName is not running at $Url"
        return $false
    }
}

function Wait-ForService {
    param([string]$ServiceName, [string]$Url, [int]$MaxWaitSeconds = 60)
    
    Write-Step "Waiting for $ServiceName to start at $Url..."
    $elapsed = 0
    $interval = 2
    
    while ($elapsed -lt $MaxWaitSeconds) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Success "$ServiceName is ready! (took $elapsed seconds)"
            return $true
        }
        catch {
            Start-Sleep -Seconds $interval
            $elapsed += $interval
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
    }
    
    Write-Error "$ServiceName failed to start within $MaxWaitSeconds seconds"
    return $false
}

function Stop-ExistingServices {
    Write-Header "STOPPING EXISTING SERVICES"
    
    # Stop Docker services
    try {
        Write-Step "Stopping Docker services..."
        docker-compose down --remove-orphans 2>$null
        Write-Success "Docker services stopped"
    }
    catch {
        Write-Warning "Docker not available or no services running"
    }
    
    # Stop .NET processes
    Write-Step "Stopping existing .NET processes..."
    Get-Process -Name "EmployeeMvp", "dotnet" -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "dotnet" -and $_.MainWindowTitle -like "*EmployeeMvp*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop Node.js processes (Frontend)
    Write-Step "Stopping existing Node.js processes..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "node" -and $_.Path -like "*frontend*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 3
    Write-Success "Existing services stopped"
}

function Start-DockerServices {
    Write-Header "STARTING DOCKER SERVICES"
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        return $false
    }
    
    # Check if Docker is running
    try {
        docker ps >$null 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker is not running. Please start Docker Desktop"
            return $false
        }
    }
    catch {
        Write-Error "Cannot connect to Docker daemon"
        return $false
    }
    
    Write-Step "Building and starting Docker services..."
    
    if ($NoBuild) {
        docker-compose up -d
    } else {
        docker-compose up -d --build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker services started"
        
        # Wait for services to be ready
        $services = @(
            @{ Name = "Backend API"; Url = "http://localhost:5000/health" },
            @{ Name = "Frontend"; Url = "http://localhost:3000" }
        )
        
        foreach ($service in $services) {
            Wait-ForService -ServiceName $service.Name -Url $service.Url -MaxWaitSeconds $WaitSeconds
        }
        
        return $true
    } else {
        Write-Error "Failed to start Docker services"
        return $false
    }
}

function Start-LocalBackend {
    Write-Header "STARTING BACKEND (.NET)"
    
    if (Test-ServiceRunning -ServiceName "Backend API" -Url "http://localhost:5000/health") {
        return $true
    }
    
    Write-Step "Building .NET project..."
    if (-not $NoBuild) {
        dotnet build EMS.sln
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build .NET project"
            return $false
        }
    }
    
    Write-Step "Starting backend API..."
    
    # Start in background
    $backendJob = Start-Job -ScriptBlock {
        param($ProjectPath)
        Set-Location $ProjectPath
        dotnet run --project EmployeeMvp.csproj --urls "http://localhost:5000;https://localhost:5001"
    } -ArgumentList (Get-Location).Path
    
    # Wait for backend to start
    if (Wait-ForService -ServiceName "Backend API" -Url "http://localhost:5000/health" -MaxWaitSeconds $WaitSeconds) {
        Write-Success "Backend API started (Job ID: $($backendJob.Id))"
        return $true
    } else {
        Write-Error "Backend API failed to start"
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
        return $false
    }
}

function Start-LocalFrontend {
    Write-Header "STARTING FRONTEND (Next.js)"
    
    if (Test-ServiceRunning -ServiceName "Frontend" -Url "http://localhost:3000") {
        return $true
    }
    
    $frontendPath = Join-Path $PWD "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Warning "Frontend directory not found at $frontendPath"
        return $false
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed or not in PATH"
        return $false
    }
    
    Push-Location $frontendPath
    
    try {
        Write-Step "Installing frontend dependencies..."
        if (-not $NoBuild -or -not (Test-Path "node_modules")) {
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to install frontend dependencies"
                return $false
            }
        }
        
        Write-Step "Starting frontend development server..."
        
        # Start in background
        $frontendJob = Start-Job -ScriptBlock {
            param($FrontendPath)
            Set-Location $FrontendPath
            npm run dev
        } -ArgumentList $frontendPath
        
        # Wait for frontend to start
        if (Wait-ForService -ServiceName "Frontend" -Url "http://localhost:3000" -MaxWaitSeconds $WaitSeconds) {
            Write-Success "Frontend started (Job ID: $($frontendJob.Id))"
            return $true
        } else {
            Write-Error "Frontend failed to start"
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            return $false
        }
    }
    finally {
        Pop-Location
    }
}

function Show-ServiceStatus {
    Write-Header "SERVICE STATUS"
    
    $services = @(
        @{ Name = "Backend API"; Url = "http://localhost:5000/health"; Port = 5000 },
        @{ Name = "Backend HTTPS"; Url = "https://localhost:5001/health"; Port = 5001 },
        @{ Name = "Frontend"; Url = "http://localhost:3000"; Port = 3000 },
        @{ Name = "Redis"; Url = ""; Port = 6379 },
        @{ Name = "PostgreSQL"; Url = ""; Port = 5432 }
    )
    
    foreach ($service in $services) {
        if ($service.Url) {
            $running = Test-ServiceRunning -ServiceName $service.Name -Url $service.Url -Timeout 3
        } else {
            # Check port for non-HTTP services
            $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            $running = $connection.TcpTestSucceeded
            if ($running) {
                Write-Success "$($service.Name) is running on port $($service.Port)"
            } else {
                Write-Info "$($service.Name) is not running on port $($service.Port)"
            }
        }
    }
    
    Write-Host ""
    Write-Info "📱 Application URLs:"
    Write-Info "   Backend API:  http://localhost:5000"
    Write-Info "   API Docs:     http://localhost:5000/swagger (if enabled)"
    Write-Info "   Frontend:     http://localhost:3000"
    Write-Info "   Health Check: http://localhost:5000/health"
    Write-Host ""
}

function Show-Logs {
    if (-not $Logs) { return }
    
    Write-Header "SERVICE LOGS"
    
    Write-Info "Recent Docker logs:"
    docker-compose logs --tail=20
    
    Write-Info "Background job status:"
    Get-Job | Format-Table -AutoSize
}

# ============================================================
# MAIN EXECUTION
# ============================================================

try {
    if ($CleanStart) {
        Stop-ExistingServices
    }
    
    $success = $true
    
    switch ($Mode) {
        "docker" {
            $success = Start-DockerServices
        }
        
        "backend-only" {
            $success = Start-LocalBackend
        }
        
        "frontend-only" {  
            $success = Start-LocalFrontend
        }
        
        "local" {
            $backendSuccess = Start-LocalBackend
            $frontendSuccess = Start-LocalFrontend
            $success = $backendSuccess -and $frontendSuccess
        }
        
        "all" {
            Write-Info "Attempting Docker first, falling back to local if needed..."
            
            $dockerSuccess = Start-DockerServices
            
            if (-not $dockerSuccess) {
                Write-Warning "Docker failed, starting services locally..."
                $backendSuccess = Start-LocalBackend  
                $frontendSuccess = Start-LocalFrontend
                $success = $backendSuccess -and $frontendSuccess
            } else {
                $success = $true
            }
        }
    }
    
    Show-ServiceStatus
    Show-Logs
    
    if ($success) {
        Write-Header "🎉 STARTUP COMPLETE"
        Write-Success "EMS is ready for testing!"
        Write-Info "Run the test suite: .\test-suite-modern.ps1"
        Write-Info "Press Ctrl+C to stop services when done"
        
        # Keep script running to maintain services
        if ($Mode -in @("local", "all", "backend-only", "frontend-only")) {
            Write-Info "Services running in background jobs. Press any key to stop all services..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            
            Write-Step "Stopping background services..."
            Get-Job | Stop-Job
            Get-Job | Remove-Job
            Write-Success "All services stopped"
        }
    } else {
        Write-Error "Failed to start EMS services"
        exit 1
    }
}
catch {
    Write-Error "Unexpected error: $($_.Exception.Message)"
    exit 1
}