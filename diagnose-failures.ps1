# Diagnostic script for failed tests
$ErrorActionPreference = "Continue"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSING FAILED TEST ENDPOINTS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Test AUTH-01: Get all users
Write-Host "`n--- AUTH-01: GET /api/auth/users ---" -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/users" -Method Get
    Write-Host "✓ SUCCESS: Got $($users.data.Count) users" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Message: $($error.message)"
        if ($error.errors) {
            Write-Host "Errors: $($error.errors | ConvertTo-Json)"
        }
    } else {
        Write-Host "No error details available"
    }
}

# Test EMP-04: Create employee
Write-Host "`n--- EMP-04: POST /api/employees ---" -ForegroundColor Yellow
$employees = Invoke-RestMethod -Uri "http://localhost:5000/api/employees" -Method Get
$validUserId = $employees.data[0].userId
Write-Host "Using userId: $validUserId"

$newEmp = @{
    userId = $validUserId
    employeeCode = "TEST$((Get-Date).Ticks % 10000)"
    departmentId = "d1111111-1111-1111-1111-111111111111"
    position = "Test Engineer"
    employmentType = "Permanent"
    hireDate = "2025-01-01T00:00:00Z"
    salary = 50000.00
    phone = "+1-555-TEST"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/employees" -Method Post -Body $newEmp -ContentType "application/json"
    Write-Host "✓ SUCCESS: Created employee" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Message: $($error.message)"
        if ($error.errors) {
            Write-Host "Errors:" -ForegroundColor Red
            $error.errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        }
    }
}

# Test ATT-03: Clock-in
Write-Host "`n--- ATT-03: POST /api/attendance/clock-in ---" -ForegroundColor Yellow
$clockInData = @{
    employeeId = $employees.data[0].id
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/clock-in" -Method Post -Body $clockInData -ContentType "application/json"
    Write-Host "✓ SUCCESS: Clocked in" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Message: $($error.message)"
        if ($error.errors) {
            Write-Host "Errors:" -ForegroundColor Red
            $error.errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        }
    }
}

# Test ATT-06: Create attendance
Write-Host "`n--- ATT-06: POST /api/attendance ---" -ForegroundColor Yellow
$attendanceData = @{
    employeeId = $employees.data[0].id
    date = (Get-Date).ToString("yyyy-MM-dd")
    clockIn = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    clockOut = (Get-Date).AddHours(8).ToString("yyyy-MM-ddTHH:mm:ss")
    status = "On Time"
    notes = "Test attendance record"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance" -Method Post -Body $attendanceData -ContentType "application/json"
    Write-Host "✓ SUCCESS: Created attendance" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Message: $($error.message)"
        if ($error.errors) {
            Write-Host "Errors:" -ForegroundColor Red
            $error.errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        }
    }
}

# Test PAY-04: Create payroll
Write-Host "`n--- PAY-04: POST /api/payroll ---" -ForegroundColor Yellow
$payrollData = @{
    employeeId = $employees.data[0].id
    month = 12
    year = 2025
    basicSalary = 50000.00
    allowances = 5000.00
    bonuses = 2500.00
    deductions = 1000.00
    tax = 7500.00
    netSalary = 49000.00
    paymentStatus = "Pending"
    paymentMethod = "Bank Transfer"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/payroll" -Method Post -Body $payrollData -ContentType "application/json"
    Write-Host "✓ SUCCESS: Created payroll" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Message: $($error.message)"
        if ($error.errors) {
            Write-Host "Errors:" -ForegroundColor Red
            $error.errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
