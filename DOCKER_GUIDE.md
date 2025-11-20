# 🐳 Docker Deployment & Testing Guide

## Overview

Complete Docker setup for the Employee Management System with automated testing. Run the entire stack (Backend, Frontend, PostgreSQL, Redis) in isolated containers.

---

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
  - Download: https://www.docker.com/products/docker-desktop
  - Minimum version: 20.10+
- **Docker Compose** (included in Docker Desktop)
  - Minimum version: 2.0+

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 10GB free space
- **CPU**: Multi-core processor recommended
- **Network**: Internet connection for image downloads

### Verify Installation
```powershell
docker --version
docker compose version
```

---

## 🚀 Quick Start

### Option 1: Automated Full Test (Recommended)

```powershell
# Run complete build, deploy, and test
.\test-docker.ps1
```

This will:
1. ✅ Check Docker installation
2. ✅ Build all images (5-10 minutes first time)
3. ✅ Start all services
4. ✅ Wait for health checks
5. ✅ Run automated API tests
6. ✅ Display results

### Option 2: Manual Docker Compose

```powershell
# Build images
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

---

## 🏗️ Architecture

### Services

1. **PostgreSQL** (`ems-postgres`)
   - Port: 5432
   - Database: employee_management
   - Volume: Persistent data storage

2. **Redis** (`ems-redis`)
   - Port: 6379
   - Purpose: Caching layer
   - Volume: Persistent cache

3. **Backend API** (`ems-backend`)
   - Ports: 5000 (HTTP), 5001 (HTTPS)
   - .NET 8 Web API
   - Health endpoint: `/health`

4. **Frontend UI** (`ems-frontend`)
   - Port: 3000
   - Next.js 14 application
   - Connects to backend API

### Network
All services communicate on `ems-network` bridge network.

---

## 📝 Configuration

### Environment Variables

Create `.env` file from template:
```powershell
copy .env.docker.example .env
```

Edit `.env` with your settings:
```ini
# JWT Secret (REQUIRED - change this!)
JWT_SECRET=your-secure-secret-key-here-min-32-characters

# Supabase (if using Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Database credentials
POSTGRES_PASSWORD=your-secure-password
```

### Docker Compose Configuration

The `docker-compose.yml` includes:
- Service definitions
- Health checks
- Dependency management
- Volume mounts
- Network configuration
- Environment variables

---

## 🧪 Testing

### Automated Test Script

```powershell
# Full test with build
.\test-docker.ps1

# Skip build (use existing images)
.\test-docker.ps1 -SkipBuild

# Show container logs
.\test-docker.ps1 -Logs

# Clean rebuild
.\test-docker.ps1 -Clean
```

### Script Output

```
================================================================
     DOCKER FULL SYSTEM TEST
================================================================

Checking Docker installation... OK
  Docker version 24.0.6

Checking Docker Compose... OK
  Docker Compose version v2.23.0

Building Docker images...
This may take 5-10 minutes on first run...
Step 1/15 : FROM mcr.microsoft.com/dotnet/aspnet:8.0
...
Build completed in 427.3 seconds

Starting all services...
Services started

Waiting for services to be ready...
  Waiting... (5/60 seconds)
  Waiting... (10/60 seconds)
All services are healthy!

Service Status:
NAME            IMAGE           STATUS          PORTS
ems-postgres    postgres:15     Up (healthy)    5432/tcp
ems-redis       redis:7         Up (healthy)    6379/tcp
ems-backend     ems-backend     Up (healthy)    5000-5001/tcp
ems-frontend    ems-frontend    Up (healthy)    3000/tcp

Testing Backend API...
  [OK] Backend health check passed
  Status: Healthy

Testing Frontend...
  [OK] Frontend is accessible

================================================================
     RUNNING AUTOMATED API TESTS
================================================================

[PASS] API health check
[PASS] Admin login
[PASS] Get all employees
...
(60+ tests)

Total Tests:  60
Passed:       60 (100.0%)
Failed:       0

SUCCESS: ALL TESTS PASSED!
```

### Manual Testing

Once services are running:

1. **Open Frontend**
   ```
   http://localhost:3000
   ```

2. **Login**
   - Email: `admin@test.com`
   - Password: `Admin@123`

3. **Test API Directly**
   ```powershell
   # Health check
   Invoke-RestMethod http://localhost:5000/health

   # Get employees (requires token)
   $headers = @{ Authorization = "Bearer YOUR_TOKEN" }
   Invoke-RestMethod http://localhost:5000/api/employees -Headers $headers
   ```

---

## 🔧 Docker Commands

### Service Management

```powershell
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart a service
docker compose restart backend

# Rebuild a service
docker compose build backend
docker compose up -d backend
```

### Viewing Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Service Status

```powershell
# List running containers
docker compose ps

# Detailed status
docker compose ps --format json

# Resource usage
docker stats
```

### Database Access

```powershell
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d employee_management

# Run SQL file
docker compose exec -T postgres psql -U postgres -d employee_management < script.sql
```

### Redis Access

```powershell
# Connect to Redis CLI
docker compose exec redis redis-cli

# Check keys
docker compose exec redis redis-cli KEYS "*"
```

### Container Shell Access

```powershell
# Backend shell
docker compose exec backend bash

# Frontend shell  
docker compose exec frontend sh

# Database shell
docker compose exec postgres bash
```

---

## 🐛 Troubleshooting

### Build Failures

**Issue**: Docker build fails with "no space left on device"
```powershell
# Clean Docker system
docker system prune -a --volumes

# Check disk usage
docker system df
```

**Issue**: Build fails with network timeout
```powershell
# Retry with increased timeout
$env:COMPOSE_HTTP_TIMEOUT=300
docker compose build
```

### Service Startup Issues

**Issue**: Services don't become healthy
```powershell
# Check logs
docker compose logs backend

# Check health status
docker inspect ems-backend --format='{{.State.Health.Status}}'
```

**Issue**: Port already in use
```powershell
# Find process using port
netstat -ano | findstr :5000

# Stop conflicting service or change port in docker-compose.yml
```

### Database Connection Issues

**Issue**: Backend can't connect to PostgreSQL
```powershell
# Check if PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Verify connection from backend
docker compose exec backend ping postgres
```

### Frontend Not Loading

**Issue**: Frontend shows connection refused
```powershell
# Check if backend is accessible
curl http://localhost:5000/health

# Check frontend logs
docker compose logs frontend

# Verify environment variable
docker compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build images
        run: docker compose build
      
      - name: Start services
        run: docker compose up -d
      
      - name: Wait for health
        run: |
          timeout 120 bash -c 'until docker compose ps | grep healthy; do sleep 5; done'
      
      - name: Run tests
        run: |
          docker compose exec -T backend dotnet test
      
      - name: Stop services
        run: docker compose down
```

### Azure DevOps Pipeline

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: Docker@2
    displayName: Build images
    inputs:
      command: build
      dockerfile: '**/Dockerfile'
  
  - script: |
      docker compose up -d
      sleep 30
      docker compose ps
    displayName: Start services
  
  - script: |
      docker compose exec -T backend dotnet test
    displayName: Run tests
  
  - script: docker compose down
    displayName: Cleanup
    condition: always()
```

---

## 📊 Performance Optimization

### Build Optimization

```dockerfile
# Use multi-stage builds (already implemented)
# Use .dockerignore to exclude unnecessary files
# Cache dependencies in separate layers
```

### Runtime Optimization

```yaml
# In docker-compose.yml, add resource limits:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Volume Optimization

```powershell
# Use named volumes for better performance
# Regular cleanup
docker volume prune
```

---

## 🔒 Security Best Practices

### Production Deployment

1. **Change default passwords**
   ```ini
   POSTGRES_PASSWORD=strong-random-password
   JWT_SECRET=secure-random-string-min-32-chars
   ```

2. **Use secrets management**
   ```yaml
   # Docker Swarm secrets
   secrets:
     db_password:
       external: true
   ```

3. **Limit exposed ports**
   ```yaml
   # Don't expose PostgreSQL to host in production
   postgres:
     # ports:
     #   - "5432:5432"  # Comment out
   ```

4. **Run as non-root**
   ```dockerfile
   USER appuser  # Already implemented in Dockerfiles
   ```

5. **Scan for vulnerabilities**
   ```powershell
   docker scan ems-backend
   docker scan ems-frontend
   ```

---

## 📈 Monitoring

### Health Checks

All services include health checks:
```powershell
# Check all health statuses
docker compose ps

# Detailed health info
docker inspect ems-backend --format='{{json .State.Health}}'
```

### Log Aggregation

```powershell
# Export logs
docker compose logs > logs.txt

# Stream to file
docker compose logs -f > live-logs.txt
```

### Metrics

```powershell
# Resource usage
docker stats

# Disk usage
docker system df
```

---

## 🎯 Testing Checklist

After running `.\test-docker.ps1`:

- [ ] All 4 services started successfully
- [ ] All health checks passing
- [ ] Backend API responding (port 5000)
- [ ] Frontend UI accessible (port 3000)
- [ ] PostgreSQL connection working
- [ ] Redis caching functional
- [ ] All 60+ API tests passing
- [ ] No error logs in containers
- [ ] Can login to frontend
- [ ] Can perform CRUD operations
- [ ] Reports generate successfully

---

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose Reference**: https://docs.docker.com/compose/compose-file/
- **.NET Docker Guide**: https://learn.microsoft.com/en-us/dotnet/core/docker/
- **Next.js Docker Guide**: https://nextjs.org/docs/deployment#docker-image

---

## 🎉 Success Criteria

✅ **Complete Docker Stack Running:**
- 4 services healthy and responsive
- Backend API passing all 60+ tests
- Frontend UI rendering correctly
- Database and cache operational
- Zero critical errors in logs
- All features functional

**Ready for production deployment!** 🚀
