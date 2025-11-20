# ============================================================
# EMS COMPLETE MANAGEMENT SCRIPT
# One script to rule them all - Setup, Start, Test, Manage
# ============================================================

param(
    [ValidateSet("setup", "start", "test", "stop", "restart", "status", "clean", "help")]
    [string]$Action = "help",
    
    [ValidateSet("docker", "local", "auto")]
    [string]$Mode = "auto",
    
    [switch]$Frontend,
    [switch]$Backend, 
    [switch]$Database,
    [switch]$Force,
    [switch]$Verbose,
    [switch]$NoTest
)

# Color functions
function Write-Header { param($Title) Write-Host "`n=== $Title ===" -ForegroundColor White -BackgroundColor DarkCyan }
function Write-Success { param($Msg) Write-Host "[SUCCESS] $Msg" -ForegroundColor Green }
function Write-Info { param($Msg) Write-Host "[INFO] $Msg" -ForegroundColor Cyan }
function Write-Warning { param($Msg) Write-Host "[WARN] $Msg" -ForegroundColor Yellow }
function Write-Error { param($Msg) Write-Host "[ERROR] $Msg" -ForegroundColor Red }
function Write-Step { param($Msg) Write-Host "[STEP] $Msg" -ForegroundColor Magenta }

function Show-Banner {
    Write-Host @"

 ███████╗███╗   ███╗███████╗    ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ 
 ██╔════╝████╗ ████║██╔════╝    ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
 █████╗  ██╔████╔██║███████╗    ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
 ██╔══╝  ██║╚██╔╝██║╚════██║    ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
 ███████╗██║ ╚═╝ ██║███████║    ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
 ╚══════╝╚═╝     ╚═╝╚══════╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                                                                
 Employee Management System - Complete Management Tool
 =====================================================================

"@ -ForegroundColor Cyan
}

function Show-Help {
    Show-Banner
    Write-Host @"
USAGE:
  .\ems.ps1 -Action <action> [options]

ACTIONS:
  setup     - Initial setup and dependency check
  start     - Start all services (backend + frontend)
  test      - Run comprehensive test suite
  stop      - Stop all running services
  restart   - Restart all services
  status    - Show current service status
  clean     - Clean up and reset environment
  help      - Show this help message

MODES:
  -Mode docker   - Use Docker containers
  -Mode local    - Use local development servers
  -Mode auto     - Auto-detect best option (default)

OPTIONS:
  -Frontend      - Only manage frontend service
  -Backend       - Only manage backend service  
  -Database      - Only manage database service
  -Force         - Force recreation/rebuild
  -Verbose       - Show detailed output
  -NoTest        - Skip automatic testing

EXAMPLES:
  .\ems.ps1 -Action setup                    # Initial setup
  .\ems.ps1 -Action start -Mode docker       # Start with Docker
  .\ems.ps1 -Action start -Mode local        # Start locally
  .\ems.ps1 -Action test -Verbose            # Run detailed tests
  .\ems.ps1 -Action restart -Backend         # Restart only backend
  .\ems.ps1 -Action clean -Force             # Complete cleanup

QUICK START:
  1. .\ems.ps1 -Action setup
  2. .\ems.ps1 -Action start  
  3. .\ems.ps1 -Action test

"@ -ForegroundColor White
}

function Test-Prerequisites {
    Write-Header "CHECKING PREREQUISITES"
    
    $issues = @()
    
    # Check .NET
    Write-Step "Checking .NET SDK..."
    try {
        $dotnetVersion = dotnet --version
        Write-Success ".NET SDK found: $dotnetVersion"
    }
    catch {
        $issues += ".NET SDK not found"
        Write-Error ".NET SDK not installed"
    }
    
    # Check Node.js
    Write-Step "Checking Node.js..."
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        $issues += "Node.js not found"
        Write-Error "Node.js not installed"
    }
    
    # Check Docker (optional)
    Write-Step "Checking Docker..."
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
        $dockerAvailable = $true
    }
    catch {
        Write-Warning "Docker not available (optional)"
        $dockerAvailable = $false
    }
    
    # Check required files
    $requiredFiles = @("EmployeeMvp.csproj", ".env", "frontend/package.json")
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "$file exists"
        } else {
            $issues += "$file missing"
            Write-Error "$file not found"
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Error "Prerequisites check failed:"
        $issues | ForEach-Object { Write-Error "  - $_" }
        return $false
    }
    
    Write-Success "All prerequisites met!"
    return $true
}

function Setup-Environment {
    Write-Header "ENVIRONMENT SETUP"
    
    if (-not (Test-Prerequisites)) {
        return $false
    }
    
    # Build backend
    Write-Step "Building .NET backend..."
    dotnet build EMS.sln
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed"
        return $false
    }
    
    # Setup frontend
    Write-Step "Setting up frontend..."
    Push-Location "frontend"
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Frontend setup failed"
            return $false
        }
    }
    finally {
        Pop-Location
    }
    
    Write-Success "Environment setup complete!"
    return $true
}

function Get-ServiceStatus {
    $status = @{
        Backend = $false
        Frontend = $false
        Database = $false
        Redis = $false
    }
    
    # Check backend
    try {
        $response = Invoke-WebRequest "http://localhost:5000/health" -TimeoutSec 3 -ErrorAction Stop
        $status.Backend = $response.StatusCode -eq 200
    } catch { }
    
    # Check frontend  
    try {
        $response = Invoke-WebRequest "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
        $status.Frontend = $response.StatusCode -eq 200
    } catch { }
    
    # Check database (via backend)
    try {
        $response = Invoke-RestMethod "http://localhost:5000/api/auth/users" -TimeoutSec 3 -ErrorAction Stop
        $status.Database = $response -ne $null
    } catch { }
    
    # Check Redis
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        $status.Redis = $connection.TcpTestSucceeded
    } catch { }
    
    return $status
}

function Show-ServiceStatus {
    Write-Header "SERVICE STATUS"
    
    $status = Get-ServiceStatus
    
    $services = @(
        @{ Name = "Backend API"; Status = $status.Backend; Url = "http://localhost:5000" },
        @{ Name = "Frontend"; Status = $status.Frontend; Url = "http://localhost:3000" },
        @{ Name = "Database"; Status = $status.Database; Url = "Via Backend API" },
        @{ Name = "Redis Cache"; Status = $status.Redis; Url = "localhost:6379" }
    )
    
    foreach ($service in $services) {
        $statusText = if ($service.Status) { "RUNNING" } else { "STOPPED" }
        $color = if ($service.Status) { "Green" } else { "Red" }
        Write-Host "  $($service.Name): $statusText ($($service.Url))" -ForegroundColor $color
    }
    
    Write-Host ""
    if ($status.Backend -and $status.Frontend) {
        Write-Success "EMS is fully operational!"
        Write-Info "   Backend API:  http://localhost:5000"
        Write-Info "   Frontend App: http://localhost:3000"
        Write-Info "   Health Check: http://localhost:5000/health"
    } else {
        Write-Warning "Some services are not running"
        Write-Info "Use: .\ems.ps1 -Action start"
    }
    
    return $status
}

function Start-Services {
    Write-Header "STARTING EMS SERVICES"
    
    $currentStatus = Get-ServiceStatus
    
    # Determine best mode if auto
    if ($Mode -eq "auto") {
        $dockerAvailable = $false
        if (Get-Command docker -ErrorAction SilentlyContinue) {
            try {
                docker ps >$null 2>&1
                $dockerAvailable = $LASTEXITCODE -eq 0
            } catch {
                $dockerAvailable = $false
            }
        }
        
        $Mode = if ($dockerAvailable -and (Test-Path "docker-compose.yml")) { "docker" } else { "local" }
        Write-Info "Auto-detected mode: $Mode"
    }
    
    if ($Mode -eq "docker") {
        Write-Step "Starting services with Docker..."
        .\docker-manage.ps1 -Action start -Force:$Force
    } else {
        Write-Step "Starting services locally..."
        .\start-ems.ps1 -Mode local -CleanStart:$Force -NoBuild:(-not $Force)
    }
    
    # Wait and verify
    Write-Step "Waiting for services to start..."
    Start-Sleep -Seconds 10
    
    $newStatus = Get-ServiceStatus
    
    if ($newStatus.Backend -and $newStatus.Frontend) {
        Write-Success "All services started successfully!"
        
        if (-not $NoTest) {
            Write-Info "Running quick health test..."
            .\test-suite-modern.ps1 -HealthOnly
        }
        
        return $true
    } else {
        Write-Error "Some services failed to start"
        return $false
    }
}

function Stop-Services {
    Write-Header "STOPPING EMS SERVICES"
    
    Write-Step "Stopping Docker services..."
    try { docker-compose down 2>$null } catch { }
    
    Write-Step "Stopping local processes..."
    Get-Process -Name "dotnet", "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.ProcessName -in @("dotnet", "node") } | 
        Stop-Process -Force -ErrorAction SilentlyContinue
    
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -ErrorAction SilentlyContinue
    
    Write-Success "Services stopped"
}

function Test-EMS {
    Write-Header "TESTING EMS APPLICATION"
    
    $status = Get-ServiceStatus
    
    if (-not ($status.Backend -and $status.Frontend)) {
        Write-Warning "Services not fully running, starting them first..."
        if (-not (Start-Services)) {
            Write-Error "Cannot run tests - services failed to start"
            return $false
        }
    }
    
    Write-Step "Running comprehensive test suite..."
    $testArgs = @()
    if ($Verbose) { $testArgs += "-Verbose" }
    
    .\test-suite-modern.ps1 @testArgs
    
    return $LASTEXITCODE -eq 0
}

function Clean-Environment {
    Write-Header "CLEANING EMS ENVIRONMENT"
    
    Stop-Services
    
    if ($Force) {
        Write-Step "Deep cleaning Docker resources..."
        .\docker-manage.ps1 -Action cleanup -Force
        
        Write-Step "Cleaning build artifacts..."
        Remove-Item -Path "bin", "obj" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "frontend/.next", "frontend/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Step "Cleaning test results..."
        Remove-Item -Path "test-results-*.json" -Force -ErrorAction SilentlyContinue
    }
    
    Write-Success "Environment cleaned"
}

# ============================================================
# MAIN EXECUTION
# ============================================================

Show-Banner

if (-not $Action -or $Action -eq "help") {
    Show-Help
    exit 0
}

Write-Info "EMS Manager - Action: $Action, Mode: $Mode"
Write-Info "Options: Frontend=$Frontend, Backend=$Backend, Force=$Force"
Write-Host ""

$success = $true

try {
    switch ($Action) {
        "setup" {
            $success = Setup-Environment
        }
        
        "start" {
            $success = Start-Services  
        }
        
        "test" {
            $success = Test-EMS
        }
        
        "stop" {
            Stop-Services
        }
        
        "restart" {
            Stop-Services
            Start-Sleep -Seconds 3
            $success = Start-Services
        }
        
        "status" {
            Show-ServiceStatus
        }
        
        "clean" {
            Clean-Environment
        }
        
        default {
            Write-Error "Unknown action: $Action"
            Show-Help
            $success = $false
        }
    }
}
catch {
    Write-Error "Unexpected error: $($_.Exception.Message)"
    $success = $false
}

if ($success) {
    Write-Header "OPERATION COMPLETE"
    Write-Success "Action '$Action' completed successfully!"
    
    if ($Action -in @("start", "restart", "setup")) {
        Write-Info ""
        Write-Info "Next steps:"
        Write-Info "  - View application: http://localhost:3000"
        Write-Info "  - Check API health: http://localhost:5000/health"
        Write-Info "  - Run tests: .\ems.ps1 -Action test"
        Write-Info "  - View status: .\ems.ps1 -Action status"
    }
    
    exit 0
} else {
    Write-Header "OPERATION FAILED"
    Write-Error "Action '$Action' failed. Check the output above for details."
    exit 1
}