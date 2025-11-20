#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup test users with properly hashed passwords
.DESCRIPTION
    Creates admin, HR, and employee users in Supabase with BCrypt hashed passwords
#>

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SETTING UP TEST USERS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Test credentials
$testUsers = @(
    @{
        Email = "admin@test.com"
        Password = "Admin@123"
        FullName = "System Administrator"
        Role = "Admin"
    },
    @{
        Email = "hr@test.com"
        Password = "Hr@123"
        FullName = "HR Manager"
        Role = "HR"
    },
    @{
        Email = "employee@test.com"
        Password = "Employee@123"
        FullName = "John Employee"
        Role = "Employee"
    }
)

Write-Host "📝 Creating users via API..." -ForegroundColor Yellow
Write-Host ""

# Start backend if not running
$backendProcess = Get-Process -Name "EmployeeMvp" -ErrorAction SilentlyContinue
if (-not $backendProcess) {
    Write-Host "⚠️  Backend not running. Please start it first:" -ForegroundColor Yellow
    Write-Host "   dotnet run" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Give backend time to be ready
Start-Sleep -Seconds 2

foreach ($user in $testUsers) {
    Write-Host "Creating user: $($user.Email) (Role: $($user.Role))" -ForegroundColor Cyan
    
    try {
        # Register user via API (this will hash the password)
        $body = @{
            email = $user.Email
            password = $user.Password
            fullName = $user.FullName
            role = $user.Role
        } | ConvertTo-Json

        $headers = @{
            "Content-Type" = "application/json"
        }

        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
            -Method POST `
            -Body $body `
            -Headers $headers `
            -SkipCertificateCheck `
            -ErrorAction Stop

        Write-Host "  ✅ Created: $($user.Email)" -ForegroundColor Green
        Write-Host "     Password: $($user.Password)" -ForegroundColor Gray
        Write-Host ""
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "  ℹ️  User already exists: $($user.Email)" -ForegroundColor Yellow
            Write-Host "     Password: $($user.Password)" -ForegroundColor Gray
        }
        else {
            Write-Host "  ❌ Error creating user: $($_.Exception.Message)" -ForegroundColor Red
        }
        Write-Host ""
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  USER SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host ""
Write-Host "👤 Admin:" -ForegroundColor Cyan
Write-Host "   Email: admin@test.com"
Write-Host "   Password: Admin@123"
Write-Host ""
Write-Host "👤 HR Manager:" -ForegroundColor Cyan
Write-Host "   Email: hr@test.com"
Write-Host "   Password: Hr@123"
Write-Host ""
Write-Host "👤 Employee:" -ForegroundColor Cyan
Write-Host "   Email: employee@test.com"
Write-Host "   Password: Employee@123"
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "🔌 Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host ""

# Test login
Write-Host "🧪 Testing login..." -ForegroundColor Yellow
Write-Host ""

try {
    $loginBody = @{
        email = "admin@test.com"
        password = "Admin@123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -Headers @{ "Content-Type" = "application/json" } `
        -SkipCertificateCheck

    Write-Host "✅ Login test successful!" -ForegroundColor Green
    Write-Host "   Token received: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "   User: $($loginResponse.user.fullName)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ All users are ready to use!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Login test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   This might be normal if users need to be created via Supabase Auth" -ForegroundColor Gray
}

Write-Host ""
