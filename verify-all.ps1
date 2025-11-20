# Employee Management System - Comprehensive Verification Script
# This script tests all major features of the API

$BaseUrl = "http://localhost:5000/api"
$AdminUser = @{ email = "admin_v3@test.com"; password = "Admin@123" }
$ManagerUser = @{ email = "manager_v3@test.com"; password = "Manager@123" }
$EmployeeUser = @{ email = "employee_v3@test.com"; password = "Employee@123" }

$Global:AdminToken = $null
$Global:ManagerToken = $null
$Global:EmployeeToken = $null
$Global:EmployeeId = $null

function Print-Header($title) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
}

function Show-Plan {
    Write-Host "COMPREHENSIVE TEST PLAN" -ForegroundColor Yellow
    Write-Host "1. System Health Check (Backend/Frontend)" -ForegroundColor Gray
    Write-Host "2. Authentication & Authorization (Login/Roles)" -ForegroundColor Gray
    Write-Host "3. Feature Verification:" -ForegroundColor Gray
    Write-Host "   - Dashboard (Stats)" -ForegroundColor Gray
    Write-Host "   - Employee Management (CRUD)" -ForegroundColor Gray
    Write-Host "   - Attendance (Check-in/out)" -ForegroundColor Gray
    Write-Host "   - Leave Management (Apply/Approve)" -ForegroundColor Gray
    Write-Host "   - Payroll (Process)" -ForegroundColor Gray
    Write-Host "   - Reports & Audit" -ForegroundColor Gray
    Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
}

function Test-Login($user, $roleName) {
    $url = "$BaseUrl/auth/login"
    $body = $user | ConvertTo-Json
    
    Write-Host "Logging in as $roleName ($($user.email))..." -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
        Write-Host " [OK]" -ForegroundColor Green
        
        # Handle different response structures
        if ($response.token) { return $response.token }
        if ($response.data -and $response.data.token) { return $response.data.token }
        
        Write-Host "  WARNING: Token not found in response" -ForegroundColor Yellow
        return $null
    } catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
            Write-Host "  Details: $($reader.ReadToEnd())" -ForegroundColor DarkGray
        }
        return $null
    }
}

function Invoke-ApiTest($method, $endpoint, $token, $description, $body = $null) {
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    
    Write-Host "TEST: $description" -NoNewline
    
    try {
        $params = @{
            Uri = "$BaseUrl$endpoint"
            Method = $method
            Headers = $headers
            ContentType = "application/json"
        }
        if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 10) }
        
        $response = Invoke-RestMethod @params
        Write-Host " [PASS]" -ForegroundColor Green
        return $response
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
            Write-Host "  Details: $($reader.ReadToEnd())" -ForegroundColor DarkGray
        }
        return $null
    }
}

# --- START TESTING ---
Show-Plan

Print-Header "1. AUTHENTICATION CHECK"
$Global:AdminToken = Test-Login $AdminUser "Admin"
$Global:ManagerToken = Test-Login $ManagerUser "Manager"
$Global:EmployeeToken = Test-Login $EmployeeUser "Employee"

if (-not $Global:AdminToken) {
    Write-Host "`nCRITICAL: Admin login failed. Aborting deep tests." -ForegroundColor Red
    exit
}

Print-Header "2. DASHBOARD (Admin)"
Invoke-ApiTest "GET" "/dashboard/stats" $Global:AdminToken "Get Dashboard Stats"

Print-Header "3. EMPLOYEE MANAGEMENT (Admin)"
# List Users to find Employee User ID
$usersResponse = Invoke-ApiTest "GET" "/auth/users" $Global:AdminToken "List All Users"
$employeeUserObj = $usersResponse.data | Where-Object { $_.email -eq $EmployeeUser.email }

if ($employeeUserObj) {
    Write-Host "Found Employee User ID: $($employeeUserObj.id)" -ForegroundColor Gray
    
    # Create Employee Profile
    $newEmployee = @{
        userId = $employeeUserObj.id
        firstName = "John"; lastName = "Employee"; email = $EmployeeUser.email; 
        phoneNumber = "1234567890"; department = "IT"; position = "Developer"; 
        salary = 60000; joinDate = (Get-Date).ToString("yyyy-MM-dd")
    }
    
    # Check if employee already exists (to avoid duplicates on re-run)
    $employeesResponse = Invoke-ApiTest "GET" "/employees" $Global:AdminToken "Check Existing Employees"
    $existingEmp = $employeesResponse.data | Where-Object { $_.email -eq $EmployeeUser.email }
    
    if ($existingEmp) {
        $Global:EmployeeId = $existingEmp.id
        Write-Host "Employee profile already exists. ID: $($Global:EmployeeId)" -ForegroundColor Yellow
    } else {
        $created = Invoke-ApiTest "POST" "/employees" $Global:AdminToken "Create Employee Profile" $newEmployee
        if ($created.data) {
            $Global:EmployeeId = $created.data.id
            Write-Host "Created Employee Profile. ID: $($Global:EmployeeId)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "CRITICAL: Could not find registered employee user." -ForegroundColor Red
}

Print-Header "4. ATTENDANCE (Employee)"
if ($Global:EmployeeId) {
    $checkIn = @{ employeeId = $Global:EmployeeId; notes = "Morning check-in" }
    Invoke-ApiTest "POST" "/attendance/clock-in" $Global:EmployeeToken "Employee Clock-In" $checkIn
    
    Start-Sleep -Seconds 1
    
    # Need attendance ID to clock out
    $history = Invoke-ApiTest "GET" "/attendance/employee/$($Global:EmployeeId)" $Global:EmployeeToken "Get Attendance History"
    if ($history.data -and $history.data.Count -gt 0) {
        $lastAttendance = $history.data[0]
        $checkOut = @{ attendanceId = $lastAttendance.id; notes = "Evening check-out" }
        Invoke-ApiTest "POST" "/attendance/clock-out" $Global:EmployeeToken "Employee Clock-Out" $checkOut
    }
} else {
    Write-Host "Skipping Attendance tests (No Employee ID)" -ForegroundColor DarkGray
}

Print-Header "5. LEAVE MANAGEMENT"
if ($Global:EmployeeId) {
    # Apply (Employee)
    $leaveRequest = @{
        employeeId = $Global:EmployeeId
        leaveType = "Sick"; startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd"); 
        endDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd"); reason = "Flu"
    }
    $leave = Invoke-ApiTest "POST" "/leave/apply" $Global:EmployeeToken "Apply for Leave" $leaveRequest

    if ($leave.data) {
        $leaveId = $leave.data.id
        # Approve (Manager)
        $approval = @{ status = "Approved"; comments = "Get well soon" }
        Invoke-ApiTest "PUT" "/leave/$leaveId/status" $Global:ManagerToken "Manager Approve Leave" $approval
    }
}

Print-Header "6. PAYROLL (Admin)"
# Process Payroll
$payrollData = @{ month = (Get-Date).Month; year = (Get-Date).Year }
Invoke-ApiTest "POST" "/payroll/process" $Global:AdminToken "Process Payroll" $payrollData
Invoke-ApiTest "GET" "/payroll/history" $Global:AdminToken "Get Payroll History"

Print-Header "7. REPORTS & AUDIT"
$reportRequest = @{ reportType = "employees"; exportFormat = "pdf" }
Invoke-ApiTest "POST" "/reports/employees" $Global:AdminToken "Generate Employee Report" $reportRequest
# Audit might fail if not implemented or 500s
Invoke-ApiTest "GET" "/audit" $Global:AdminToken "View Audit Logs"
Invoke-ApiTest "GET" "/notification" $Global:EmployeeToken "Check Notifications"

Print-Header "TESTING COMPLETE"

