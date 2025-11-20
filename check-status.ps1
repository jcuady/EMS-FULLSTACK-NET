#!/usr/bin/env pwsh
# Complete system status check

Write-Host ""
Write-Host "EMPLOYEE MANAGEMENT SYSTEM - STATUS CHECK" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check backend
Write-Host "Backend API..........." -NoNewline
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
    Write-Host " [OK] Running" -ForegroundColor Green
} catch {
    Write-Host " [FAIL] Not responding" -ForegroundColor Red
    $allGood = $false
}

# Check frontend
Write-Host "Frontend UI..........." -NoNewline
try {
    Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing | Out-Null
    Write-Host " [OK] Running" -ForegroundColor Green
} catch {
    Write-Host " [FAIL] Not responding" -ForegroundColor Red
    $allGood = $false
}

# Check database
Write-Host "Database.............." -NoNewline
try {
    $users = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/users" -TimeoutSec 5
    $count = $users.Count
    Write-Host " [OK] Connected - $count users" -ForegroundColor Green
} catch {
    Write-Host " [FAIL] Connection failed" -ForegroundColor Red
    $allGood = $false
}

# Test logins
Write-Host "`nTesting Authentication:" -ForegroundColor Yellow
$credentials = @(
    @{ email = "admin@test.com"; password = "Admin@123"; role = "Admin" },
    @{ email = "manager@test.com"; password = "Manager@123"; role = "Manager" },
    @{ email = "employee@test.com"; password = "Employee@123"; role = "Employee" }
)

$loginsPassed = 0
foreach ($cred in $credentials) {
    Write-Host "  $($cred.role)..............." -NoNewline
    $body = @{ email = $cred.email; password = $cred.password } | ConvertTo-Json
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
        Write-Host " [OK] Success" -ForegroundColor Green
        $loginsPassed++
    } catch {
        Write-Host " [FAIL] Failed" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
if ($allGood) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "SUCCESS - ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""  
    Write-Host "Open: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Login with:" -ForegroundColor Yellow
    Write-Host "  admin@test.com / Admin@123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "WARNING - SOME ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    if ($loginsPassed -eq 0) {
        Write-Host "Fix steps:" -ForegroundColor Yellow
        Write-Host "  1. Run SQL in Supabase to delete test users" -ForegroundColor White
        Write-Host "  2. Run register-users.ps1 script" -ForegroundColor White
    }
    Write-Host ""
}
