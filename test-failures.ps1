# Quick diagnostic for failed tests

Write-Host "=== Testing Failed Endpoints ===" -ForegroundColor Cyan

# EMP-04
Write-Host "`n1. EMP-04: Create Employee" -ForegroundColor Yellow
$employees = Invoke-RestMethod -Uri "http://localhost:5000/api/employees" -Method Get
$body = @{
    userId = $employees.data[0].userId
    employeeCode = "TEST9999"
    departmentId = "d1111111-1111-1111-1111-111111111111"
    position = "Test"
    employmentType = "Permanent"
    hireDate = "2025-01-01T00:00:00Z"
    salary = 50000
    phone = "+1-555-9999"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/employees" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  PASS" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($err.message)" -ForegroundColor Red
    }
}

# ATT-03
Write-Host "`n2. ATT-03: Clock-in" -ForegroundColor Yellow
$body = @{ employeeId = $employees.data[0].id } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/clock-in" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  PASS" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($err.message)" -ForegroundColor Red
    }
}

# ATT-06
Write-Host "`n3. ATT-06: Create Attendance" -ForegroundColor Yellow
$body = @{
    employeeId = $employees.data[0].id
    date = "2025-12-01"
    clockIn = "2025-12-01T09:00:00"
    clockOut = "2025-12-01T17:00:00"
    status = "On Time"
    notes = "Test"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/attendance" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  PASS" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($err.message)" -ForegroundColor Red
    }
}

# PAY-04
Write-Host "`n4. PAY-04: Create Payroll" -ForegroundColor Yellow
$body = @{
    employeeId = $employees.data[0].id
    month = 12
    year = 2025
    basicSalary = 50000
    allowances = 5000
    bonuses = 2500
    deductions = 1000
    tax = 7500
    netSalary = 49000
    paymentStatus = "Pending"
    paymentMethod = "Bank Transfer"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/payroll" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  PASS" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($err.message)" -ForegroundColor Red
    }
}

# AUTH-01
Write-Host "`n5. AUTH-01: Get Users" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/users" -Method Get
    Write-Host "  PASS" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($err.message)" -ForegroundColor Red
    }
}

Write-Host "`nDone" -ForegroundColor Cyan
