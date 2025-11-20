#!/usr/bin/env pwsh
# Register test users via API to ensure correct password hashing
param (
    [switch]$SkipSqlPrompt
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  REGISTERING TEST USERS VIA API" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipSqlPrompt) {
    Write-Host "Step 1: Delete existing users in Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "   DELETE FROM users WHERE email IN ('admin@test.com', 'manager@test.com', 'employee@test.com');" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after running the SQL..."
} else {
    Write-Host "Skipping SQL prompt (assuming users are deleted)..." -ForegroundColor DarkGray
}

Write-Host "`nStep 2: Registering users via API..." -ForegroundColor Yellow
Write-Host ""

$users = @(
    @{ email = "admin_v3@test.com"; password = "Admin@123"; fullName = "System Administrator"; role = "admin" },
    @{ email = "manager_v3@test.com"; password = "Manager@123"; fullName = "HR Manager"; role = "manager" },
    @{ email = "employee_v3@test.com"; password = "Employee@123"; fullName = "John Employee"; role = "employee" }
)

$registered = 0
$failed = 0

foreach ($user in $users) {
    Write-Host "Registering: $($user.fullName) ($($user.email))..." -ForegroundColor Cyan
    $body = $user | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
        Write-Host "  ✅ SUCCESS - User registered" -ForegroundColor Green
        $registered++
    } catch {
        Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Registration complete: $registered success, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($registered -gt 0) {
    Write-Host "Step 3: Testing logins..." -ForegroundColor Yellow
    Write-Host ""
    
    $loginSuccess = 0
    foreach ($user in $users) {
        $loginBody = @{ email = $user.email; password = $user.password } | ConvertTo-Json
        try {
            $r = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
            Write-Host "✅ $($user.email) - Login successful!" -ForegroundColor Green
            $loginSuccess++
        } catch {
            Write-Host "❌ $($user.email) - Login failed" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    if ($loginSuccess -eq $users.Count) {
        Write-Host "🎉 ALL USERS WORKING!" -ForegroundColor Green
        Write-Host "🌐 Login at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Credentials:" -ForegroundColor Yellow
        Write-Host "  admin@test.com / Admin@123" -ForegroundColor White
        Write-Host "  manager@test.com / Manager@123" -ForegroundColor White
        Write-Host "  employee@test.com / Employee@123" -ForegroundColor White
    }
}
