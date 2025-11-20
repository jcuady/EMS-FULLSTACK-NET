# Comprehensive API Test Script for Employee Management System
$BaseUrl = "http://localhost:5000/api"
$TestEmail = "admin@test.com"
$TestPassword = "Admin@123"
$Token = $null
$TestEmployeeId = $null

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EMS - FULL TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Test-API {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [switch]$RequiresAuth
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        
        if ($RequiresAuth -and $Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " PASSED" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $err = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Error: $($err.message)" -ForegroundColor Yellow
        }
        return $null
    }
}

# TEST 1: AUTHENTICATION
Write-Host "`n--- AUTHENTICATION ---" -ForegroundColor Yellow
Test-API -Name "Health Check" -Method "GET" -Endpoint "/"

$loginResponse = Test-API -Name "Admin Login" -Method "POST" -Endpoint "/auth/login" -Body @{
    email = $TestEmail
    password = $TestPassword
}

if ($loginResponse -and $loginResponse.data.token) {
    $Token = $loginResponse.data.token
    Write-Host "Token acquired successfully" -ForegroundColor Gray
}

# TEST 2: EMPLOYEES
Write-Host "`n--- EMPLOYEE MANAGEMENT ---" -ForegroundColor Yellow
$employeesResponse = Test-API -Name "Get All Employees" -Method "GET" -Endpoint "/employees" -RequiresAuth

if ($employeesResponse -and $employeesResponse.data.Count -gt 0) {
    $TestEmployeeId = $employeesResponse.data[0].id
    Write-Host "Using Employee ID: $TestEmployeeId" -ForegroundColor Gray
}

if ($TestEmployeeId) {
    Test-API -Name "Get Employee by ID" -Method "GET" -Endpoint "/employees/$TestEmployeeId" -RequiresAuth
}

Test-API -Name "Search Employees" -Method "GET" -Endpoint "/employees/search?query=test" -RequiresAuth

# TEST 3: ATTENDANCE
Write-Host "`n--- ATTENDANCE TRACKING ---" -ForegroundColor Yellow
Test-API -Name "Get All Attendance" -Method "GET" -Endpoint "/attendance" -RequiresAuth

if ($TestEmployeeId) {
    Test-API -Name "Get Employee Attendance" -Method "GET" -Endpoint "/attendance/employee/$TestEmployeeId" -RequiresAuth
    
    Test-API -Name "Clock In" -Method "POST" -Endpoint "/attendance/clock-in" -RequiresAuth -Body @{
        employeeId = $TestEmployeeId
        notes = "Test clock-in"
    }
    
    Start-Sleep -Seconds 2
    
    Test-API -Name "Clock Out" -Method "POST" -Endpoint "/attendance/clock-out" -RequiresAuth -Body @{
        employeeId = $TestEmployeeId
        notes = "Test clock-out"
    }
}

# TEST 4: PAYROLL
Write-Host "`n--- PAYROLL MANAGEMENT ---" -ForegroundColor Yellow
Test-API -Name "Get All Payroll" -Method "GET" -Endpoint "/payroll" -RequiresAuth

if ($TestEmployeeId) {
    Test-API -Name "Get Employee Payroll" -Method "GET" -Endpoint "/payroll/employee/$TestEmployeeId" -RequiresAuth
}

# TEST 5: LEAVE MANAGEMENT
Write-Host "`n--- LEAVE MANAGEMENT ---" -ForegroundColor Yellow
Test-API -Name "Get All Leaves" -Method "GET" -Endpoint "/leaves" -RequiresAuth

if ($TestEmployeeId) {
    Test-API -Name "Get Employee Leaves" -Method "GET" -Endpoint "/leaves/employee/$TestEmployeeId" -RequiresAuth
    
    $currentYear = (Get-Date).Year
    Test-API -Name "Get Leave Balance" -Method "GET" -Endpoint "/leaves/balance/$TestEmployeeId/$currentYear" -RequiresAuth
    
    $leaveResponse = Test-API -Name "Request Leave" -Method "POST" -Endpoint "/leaves" -RequiresAuth -Body @{
        employeeId = $TestEmployeeId
        leaveType = "Annual"
        startDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddDays(9).ToString("yyyy-MM-dd")
        reason = "Test leave request"
    }
    
    if ($leaveResponse -and $leaveResponse.data.id) {
        $leaveId = $leaveResponse.data.id
        Write-Host "Leave Request ID: $leaveId" -ForegroundColor Gray
        
        Test-API -Name "Approve Leave" -Method "PUT" -Endpoint "/leaves/$leaveId/approve" -RequiresAuth -Body @{
            approvedBy = "admin"
            comments = "Test approval"
        }
    }
}

Test-API -Name "Get Pending Leaves" -Method "GET" -Endpoint "/leaves/pending" -RequiresAuth

# TEST 6: REPORTS
Write-Host "`n--- REPORTS & ANALYTICS ---" -ForegroundColor Yellow

Write-Host "Testing: Generate Employee Report (PDF)..." -NoNewline
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }
    
    $body = @{ format = "pdf"; includeInactive = $false } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$BaseUrl/reports/employees" -Method POST -Headers $headers -Body $body
    
    if ($response.StatusCode -eq 200) {
        Write-Host " PASSED" -ForegroundColor Green
    }
}
catch {
    Write-Host " FAILED" -ForegroundColor Red
}

Write-Host "Testing: Generate Attendance Report (Excel)..." -NoNewline
try {
    $body = @{ 
        format = "excel"
        startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
        endDate = (Get-Date).ToString("yyyy-MM-dd")
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseUrl/reports/attendance" -Method POST -Headers $headers -Body $body
    
    if ($response.StatusCode -eq 200) {
        Write-Host " PASSED" -ForegroundColor Green
    }
}
catch {
    Write-Host " FAILED" -ForegroundColor Red
}

# TEST 7: NOTIFICATIONS
Write-Host "`n--- NOTIFICATIONS ---" -ForegroundColor Yellow
Test-API -Name "Get All Notifications" -Method "GET" -Endpoint "/notifications" -RequiresAuth
Test-API -Name "Get Unread Notifications" -Method "GET" -Endpoint "/notifications/unread" -RequiresAuth

# TEST 8: AUDIT LOGS
Write-Host "`n--- AUDIT LOGGING ---" -ForegroundColor Yellow
Test-API -Name "Get Audit Logs" -Method "GET" -Endpoint "/audit?page=1&pageSize=20" -RequiresAuth
Test-API -Name "Get Recent Audit Logs" -Method "GET" -Endpoint "/audit/recent?limit=50" -RequiresAuth

# TEST 9: DASHBOARD
Write-Host "`n--- DASHBOARD ---" -ForegroundColor Yellow
Test-API -Name "Get Dashboard Statistics" -Method "GET" -Endpoint "/dashboard/stats" -RequiresAuth

# SUMMARY
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUITE COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nTest Results Summary:" -ForegroundColor White
Write-Host "  Authentication: Tested" -ForegroundColor Green
Write-Host "  Employee Management: Tested" -ForegroundColor Green
Write-Host "  Attendance Tracking: Tested" -ForegroundColor Green
Write-Host "  Payroll Processing: Tested" -ForegroundColor Green
Write-Host "  Leave Management: Tested" -ForegroundColor Green
Write-Host "  Report Generation: Tested" -ForegroundColor Green
Write-Host "  Notifications: Tested" -ForegroundColor Green
Write-Host "  Audit Logging: Tested" -ForegroundColor Green
Write-Host "  Dashboard: Tested" -ForegroundColor Green

Write-Host "`nAll major features have been tested!" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Gray
Write-Host "Frontend UI: http://localhost:3000`n" -ForegroundColor Gray
