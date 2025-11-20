# Test API with error details
Write-Host "=== Testing .NET API POST Endpoints ===" -ForegroundColor Cyan

$employees = Invoke-RestMethod -Uri "http://localhost:5000/api/employees" -Method Get
$employeeId = $employees.data[0].id

# Test ATT-03: Clock-in
Write-Host "`n1. ATT-03: Clock-in" -ForegroundColor Yellow
$body = @{ employeeId = $employeeId } | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/attendance/clock-in" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
} catch {
    Write-Host "  FAILED: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $errorContent = $_.ErrorDetails.Message
    if ($errorContent) {
        $error = $errorContent | ConvertFrom-Json
        Write-Host "  Message: $($error.message)" -ForegroundColor Red
        if ($error.errors) {
            $error.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        }
    }
}

# Test ATT-06: Create attendance  
Write-Host "`n2. ATT-06: Create Attendance" -ForegroundColor Yellow
$body = @{
    employeeId = $employeeId
    date = "2025-12-15"
    clockIn = "2025-12-15T08:00:00"
    clockOut = "2025-12-15T16:00:00"
    status = "On Time"
    notes = "API Test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/attendance" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
} catch {
    Write-Host "  FAILED: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $errorContent = $_.ErrorDetails.Message
    if ($errorContent) {
        $error = $errorContent | ConvertFrom-Json
        Write-Host "  Message: $($error.message)" -ForegroundColor Red
        if ($error.errors) {
            $error.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        }
    }
}

# Test PAY-04: Create payroll
Write-Host "`n3. PAY-04: Create Payroll" -ForegroundColor Yellow
$body = @{
    employeeId = $employeeId
    month = 1
    year = 2026
    basicSalary = 60000
    allowances = 6000
    bonuses = 3000
    deductions = 1200
    tax = 9000
    netSalary = 58800
    paymentStatus = "Pending"
    paymentMethod = "Bank Transfer"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/payroll" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
} catch {
    Write-Host "  FAILED: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $errorContent = $_.ErrorDetails.Message
    if ($errorContent) {
        $error = $errorContent | ConvertFrom-Json
        Write-Host "  Message: $($error.message)" -ForegroundColor Red
        if ($error.errors) {
            $error.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        }
    }
}

Write-Host "`nDone" -ForegroundColor Cyan
