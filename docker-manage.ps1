# ============================================================
# EMS DOCKER SETUP AND MANAGEMENT SCRIPT
# Comprehensive Docker environment management
# ============================================================

param(
    [ValidateSet("setup", "start", "stop", "restart", "rebuild", "cleanup", "logs", "status")]
    [string]$Action = "setup",
    
    [switch]$Production,
    [switch]$Force,
    [switch]$Follow,
    [string]$Service = ""
)

function Write-Header { param($Title) Write-Host "`n=== $Title ===" -ForegroundColor Cyan -BackgroundColor DarkBlue }
function Write-Success { param($Msg) Write-Host "✅ $Msg" -ForegroundColor Green }
function Write-Info { param($Msg) Write-Host "ℹ️  $Msg" -ForegroundColor Cyan }
function Write-Warning { param($Msg) Write-Host "⚠️  $Msg" -ForegroundColor Yellow }
function Write-Error { param($Msg) Write-Host "❌ $Msg" -ForegroundColor Red }
function Write-Step { param($Msg) Write-Host "🔄 $Msg" -ForegroundColor Magenta }

Write-Host @"

 ██████╗  ██████╗  ██████╗██╗  ██╗███████╗██████╗     ███████╗███╗   ███╗███████╗
 ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗    ██╔════╝████╗ ████║██╔════╝
 ██║  ██║██║   ██║██║     █████╔╝ █████╗  ██████╔╝    █████╗  ██╔████╔██║███████╗
 ██║  ██║██║   ██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗    ██╔══╝  ██║╚██╔╝██║╚════██║
 ██████╔╝╚██████╔╝╚██████╗██║  ██╗███████╗██║  ██║    ███████╗██║ ╚═╝ ██║███████║
 ╚═════╝  ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝     ╚═╝╚══════╝
                                                                                   
 Employee Management System - Docker Management
 =============================================================

"@ -ForegroundColor Cyan

function Test-DockerAvailable {
    Write-Step "Checking Docker availability..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        Write-Info "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        return $false
    }
    
    try {
        $version = docker --version
        Write-Success "Docker found: $version"
        
        docker ps >$null 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker daemon is not running"
            Write-Info "Please start Docker Desktop and try again"
            return $false
        }
        
        Write-Success "Docker daemon is running"
        return $true
    }
    catch {
        Write-Error "Cannot connect to Docker daemon"
        return $false
    }
}

function Test-DockerCompose {
    Write-Step "Checking Docker Compose..."
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $version = docker-compose --version
        Write-Success "Docker Compose found: $version"
        return $true
    }
    elseif (docker compose version 2>$null) {
        $version = docker compose version
        Write-Success "Docker Compose (built-in) found: $version"
        return $true  
    }
    else {
        Write-Error "Docker Compose not found"
        return $false
    }
}

function Setup-Environment {
    Write-Header "ENVIRONMENT SETUP"
    
    # Check required files
    $requiredFiles = @(
        "docker-compose.yml",
        ".env", 
        "Dockerfile",
        "EmployeeMvp.csproj"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "$file exists"
        } else {
            Write-Warning "$file not found - may cause issues"
        }
    }
    
    # Create frontend Dockerfile if missing
    $frontendDockerfile = "frontend/Dockerfile"
    if (-not (Test-Path $frontendDockerfile)) {
        Write-Step "Creating frontend Dockerfile..."
        
        $frontendDockerContent = @"
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
"@
        
        New-Item -ItemType Directory -Path "frontend" -Force >$null
        $frontendDockerContent | Out-File -FilePath $frontendDockerfile -Encoding UTF8
        Write-Success "Created frontend Dockerfile"
    }
    
    Write-Success "Environment setup complete"
}

function Docker-Setup {
    Write-Header "DOCKER SETUP"
    
    if (-not (Test-DockerAvailable -and Test-DockerCompose)) {
        return $false
    }
    
    Setup-Environment
    
    Write-Step "Pulling required images..."
    docker pull postgres:15-alpine
    docker pull redis:7-alpine
    docker pull node:18-alpine
    
    Write-Success "Docker setup complete"
    return $true
}

function Docker-Start {
    Write-Header "STARTING DOCKER SERVICES"
    
    $composeFile = "docker-compose.yml"
    if ($Production) {
        $composeFile = "docker-compose.prod.yml"
        if (-not (Test-Path $composeFile)) {
            Write-Warning "Production compose file not found, using default"
            $composeFile = "docker-compose.yml"
        }
    }
    
    Write-Step "Starting services with $composeFile..."
    
    if ($Force) {
        docker-compose -f $composeFile down --remove-orphans
        docker-compose -f $composeFile up -d --build --force-recreate
    } else {
        docker-compose -f $composeFile up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started successfully"
        
        Write-Step "Waiting for services to be ready..."
        Start-Sleep -Seconds 10
        
        Show-ServiceStatus
        return $true
    } else {
        Write-Error "Failed to start services"
        return $false
    }
}

function Docker-Stop {
    Write-Header "STOPPING DOCKER SERVICES"
    
    Write-Step "Stopping all services..."
    docker-compose down
    
    if ($Force) {
        Write-Step "Removing volumes and networks..."
        docker-compose down -v --remove-orphans
        docker system prune -f
    }
    
    Write-Success "Services stopped"
}

function Docker-Restart {
    Write-Header "RESTARTING DOCKER SERVICES"
    
    if ($Service) {
        Write-Step "Restarting service: $Service"
        docker-compose restart $Service
    } else {
        Docker-Stop
        Docker-Start
    }
}

function Docker-Rebuild {
    Write-Header "REBUILDING DOCKER SERVICES"
    
    Write-Step "Stopping services..."
    docker-compose down
    
    Write-Step "Removing images..."
    docker-compose down --rmi all
    
    Write-Step "Rebuilding and starting..."
    docker-compose up -d --build --force-recreate
    
    Write-Success "Rebuild complete"
}

function Docker-Cleanup {
    Write-Header "DOCKER CLEANUP"
    
    Write-Step "Stopping all containers..."
    docker-compose down -v --remove-orphans
    
    Write-Step "Removing unused images..."
    docker image prune -f
    
    Write-Step "Removing unused volumes..."
    docker volume prune -f
    
    Write-Step "Removing unused networks..."
    docker network prune -f
    
    if ($Force) {
        Write-Step "Removing ALL unused Docker resources..."
        docker system prune -a -f --volumes
    }
    
    Write-Success "Cleanup complete"
}

function Show-Logs {
    Write-Header "DOCKER LOGS"
    
    if ($Service) {
        Write-Info "Showing logs for service: $Service"
        if ($Follow) {
            docker-compose logs -f $Service
        } else {
            docker-compose logs --tail=50 $Service
        }
    } else {
        Write-Info "Showing logs for all services"
        if ($Follow) {
            docker-compose logs -f
        } else {
            docker-compose logs --tail=20
        }
    }
}

function Show-ServiceStatus {
    Write-Header "SERVICE STATUS"
    
    Write-Step "Checking container status..."
    docker-compose ps
    
    Write-Step "Checking service health..."
    $services = @(
        @{ Name = "Backend API"; Url = "http://localhost:5000/health" },
        @{ Name = "Frontend"; Url = "http://localhost:3000" },
        @{ Name = "PostgreSQL"; Port = 5432 },
        @{ Name = "Redis"; Port = 6379 }
    )
    
    foreach ($service in $services) {
        if ($service.Url) {
            try {
                $response = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
                Write-Success "$($service.Name) is healthy"
            }
            catch {
                Write-Warning "$($service.Name) is not responding"
            }
        } else {
            $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                Write-Success "$($service.Name) is running on port $($service.Port)"
            } else {
                Write-Warning "$($service.Name) is not accessible on port $($service.Port)"
            }
        }
    }
    
    Write-Host ""
    Write-Info "📱 Application URLs:"
    Write-Info "   Backend API:  http://localhost:5000"
    Write-Info "   Frontend:     http://localhost:3000"
    Write-Info "   Health Check: http://localhost:5000/health"
    Write-Host ""
}

# ============================================================
# MAIN EXECUTION
# ============================================================

Write-Info "Docker Management Action: $Action"
if ($Service) { Write-Info "Target Service: $Service" }
if ($Production) { Write-Info "Production Mode: Enabled" }
if ($Force) { Write-Info "Force Mode: Enabled" }
Write-Host ""

switch ($Action) {
    "setup" { 
        Docker-Setup 
    }
    
    "start" { 
        Docker-Start 
    }
    
    "stop" { 
        Docker-Stop 
    }
    
    "restart" { 
        Docker-Restart 
    }
    
    "rebuild" { 
        Docker-Rebuild 
    }
    
    "cleanup" { 
        Docker-Cleanup 
    }
    
    "logs" { 
        Show-Logs 
    }
    
    "status" { 
        Show-ServiceStatus 
    }
    
    default {
        Write-Error "Unknown action: $Action"
        Write-Info "Available actions: setup, start, stop, restart, rebuild, cleanup, logs, status"
        exit 1
    }
}