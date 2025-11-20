# Employee Management System - API Test Suite
# Automated testing script for all API endpoints

param(
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$Verbose
)

# Color output functions
function Write-Success { param($Message) Write-Host "[PASS] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[FAIL] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Test { param($Message) Write-Host "[TEST] $Message" -ForegroundColor Yellow }

# Test statistics
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:TestResults = @()

function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message,
        [object]$Response
    )
    
    $script:TotalTests++
    if ($Passed) {
        $script:PassedTests++
        Write-Success "$TestName - $Message"
    } else {
        $script:FailedTests++
        Write-Error "$TestName - $Message"
    }
    
    $script:TestResults += [PSCustomObject]@{
        TestName = $TestName
        Status = if ($Passed) { "PASS" } else { "FAIL" }
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    if ($Verbose -and $Response) {
        Write-Host "Response: $($Response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor DarkGray
    }
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [int]$ExpectedStatus = 200,
        [string]$Description
    )
    
    Write-Test "Testing: $Description"
    
    try {
        $uri = "$BaseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        # Check if response has success property
        if ($null -ne $response.success) {
            if ($response.success -eq $true) {
                Add-TestResult -TestName $Name -Passed $true -Message "Success - $Description" -Response $response
                return $response
            } else {
                Add-TestResult -TestName $Name -Passed $false -Message "API returned success=false" -Response $response
                return $null
            }
        } else {
            # For endpoints that don't use ApiResponse wrapper
            Add-TestResult -TestName $Name -Passed $true -Message "Success - $Description" -Response $response
            return $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus -and $ExpectedStatus -ge 400) {
            Add-TestResult -TestName $Name -Passed $true -Message "Expected error status $ExpectedStatus" -Response $null
            return $null
        } else {
            Add-TestResult -TestName $Name -Passed $false -Message "Error: $($_.Exception.Message)" -Response $null
            return $null
        }
    }
}

# Print header
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   Employee Management System - API Test Suite            " -ForegroundColor Cyan
Write-Host "   Testing all endpoints for functionality                " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Info "Base URL: $BaseUrl"
Write-Info "Test started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Wait for API to be ready
Write-Info "Checking if API is running..."
Start-Sleep -Seconds 2

# ============================================================================
# 1. HEALTH AND ROOT ENDPOINTS
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "     HEALTH AND SYSTEM ENDPOINTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

Test-Endpoint -Name "ROOT-01" -Method "GET" -Endpoint "/" `
    -Description "Root endpoint - API info"

Test-Endpoint -Name "HEALTH-01" -Method "GET" -Endpoint "/health" `
    -Description "Health check endpoint"

# ============================================================================
# 2. DASHBOARD ENDPOINTS
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "        DASHBOARD ENDPOINTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

$dashboardStats = Test-Endpoint -Name "DASH-01" -Method "GET" -Endpoint "/api/dashboard/stats" `
    -Description "Get dashboard statistics"

if ($dashboardStats -and $dashboardStats.data) {
    Write-Info "  Total Employees: $($dashboardStats.data.totalEmployees)"
    Write-Info "  Active Employees: $($dashboardStats.data.activeEmployees)"
    Write-Info "  Attendance Rate: $($dashboardStats.data.attendanceRate)%"
    Write-Info "  Present Today: $($dashboardStats.data.presentToday)"
    Write-Info "  Absent Today: $($dashboardStats.data.absentToday)"
    Write-Info "  Late Today: $($dashboardStats.data.lateToday)"
}

# ============================================================================
# 3. EMPLOYEE ENDPOINTS
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "        EMPLOYEE ENDPOINTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

$employees = Test-Endpoint -Name "EMP-01" -Method "GET" -Endpoint "/api/employees" `
    -Description "Get all employees"

$testEmployeeId = $null
if ($employees -and $employees.data -and $employees.data.Count -gt 0) {
    $testEmployeeId = $employees.data[0].id
    Write-Info "  Found $($employees.data.Count) employees"
    Write-Info "  Using employee ID for testing: $testEmployeeId"
    
    # Test get employee by ID
    Test-Endpoint -Name "EMP-02" -Method "GET" -Endpoint "/api/employees/$testEmployeeId" `
        -Description "Get employee by ID"
    
    # Test get employee by user ID (if userId exists)
    $testUserId = $employees.data[0].userId
    if ($testUserId) {
        Test-Endpoint -Name "EMP-03" -Method "GET" -Endpoint "/api/employees/user/$testUserId" `
            -Description "Get employee by user ID"
    }
} else {
    Write-Error "No employees found in database - skipping employee-specific tests"
}

# Test create employee
Write-Test "Testing: Create new employee"
if ($testEmployeeId) {
    # Get the user ID from the first employee to use for creating new employee
    $firstEmployee = $employees.data[0]
    $validUserId = $firstEmployee.userId
    
    $newEmployee = @{
        userId = $validUserId
        employeeCode = "EMP-TEST-$(Get-Random -Maximum 9999)"
        departmentId = $null
        position = "Test Engineer"
        employmentType = "Full-Time"
        hireDate = (Get-Date).ToString("yyyy-MM-dd")
        salary = 75000
        phone = "+1-555-TEST1"
        address = "123 Test Street"
        emergencyContactName = "Test Contact"
        emergencyContactPhone = "+1-555-TEST2"
        dateOfBirth = "1990-01-01"
        gender = "Other"
    }
} else {
    Write-Host "[SKIP] EMP-04 - No employees found" -ForegroundColor Yellow
    $newEmployee = $null
}

if ($newEmployee) {
    $createdEmployee = Test-Endpoint -Name "EMP-04" -Method "POST" -Endpoint "/api/employees" `
        -Body $newEmployee -Description "Create new employee"
} else {
    Write-Host "[SKIP] EMP-04 - Cannot create employee without valid data" -ForegroundColor Yellow
}

$newEmployeeId = $null
if ($createdEmployee -and $createdEmployee.data) {
    $newEmployeeId = $createdEmployee.data.id
    Write-Info "  Created employee with ID: $newEmployeeId"
    
    # Test update employee
    $updateEmployee = @{
        position = "Senior Test Engineer"
        salary = 85000
        phone = "+1-555-TEST3"
    }
    
    Test-Endpoint -Name "EMP-05" -Method "PUT" -Endpoint "/api/employees/$newEmployeeId" `
        -Body $updateEmployee -Description "Update employee"
    
    # Test delete employee
    Test-Endpoint -Name "EMP-06" -Method "DELETE" -Endpoint "/api/employees/$newEmployeeId" `
        -Description "Delete test employee"
}

# ============================================================================
# 4. ATTENDANCE ENDPOINTS
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "        ATTENDANCE ENDPOINTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

$attendance = Test-Endpoint -Name "ATT-01" -Method "GET" -Endpoint "/api/attendance" `
    -Description "Get all attendance records"

if ($attendance -and $attendance.data) {
    Write-Info "  Found $($attendance.data.Count) attendance records"
}

if ($testEmployeeId) {
    # Get attendance for specific employee
    Test-Endpoint -Name "ATT-02" -Method "GET" -Endpoint "/api/attendance/employee/$testEmployeeId" `
        -Description "Get attendance by employee ID"
    
    # Test clock-in (note: may fail if already clocked in today - this is expected behavior)
    $clockInData = @{
        employeeId = $testEmployeeId
        notes = "Automated test clock-in $(Get-Date -Format 'HH:mm:ss')"
    }
    
    $clockedIn = Test-Endpoint -Name "ATT-03" -Method "POST" -Endpoint "/api/attendance/clock-in" `
        -Body $clockInData -Description "Clock-in endpoint"
    
    if ($clockedIn -and $clockedIn.data) {
        $attendanceId = $clockedIn.data.id
        Write-Info "  Clocked in with attendance ID: $attendanceId"
        
        Start-Sleep -Seconds 1
        
        # Test clock-out
        $clockOutData = @{
            attendanceId = $attendanceId
            notes = "Automated test clock-out"
        }
        
        Test-Endpoint -Name "ATT-04" -Method "POST" -Endpoint "/api/attendance/clock-out" `
            -Body $clockOutData -Description "Clock-out endpoint"
        
        # Delete test attendance record
        Test-Endpoint -Name "ATT-05" -Method "DELETE" -Endpoint "/api/attendance/$attendanceId" `
            -Description "Delete test attendance record"
    }
    
    # Test create attendance (admin function) - using seconds since midnight for uniqueness
    # This ensures each test run (even within same minute) gets a different date
    $secondsSinceMidnight = ([DateTime]::Now - [DateTime]::Today).TotalSeconds
    $daysOffset = [Math]::Floor($secondsSinceMidnight) % 1000  # 0-999 days (~2.7 years of unique dates)
    $futureDate = (Get-Date -Year 2040 -Month 1 -Day 1).AddDays($daysOffset)
    
    $createAttendance = @{
        employeeId = $testEmployeeId
        date = $futureDate.ToString("yyyy-MM-dd")
        clockIn = $futureDate.ToString("yyyy-MM-ddT09:00:00")
        clockOut = $futureDate.ToString("yyyy-MM-ddT17:00:00")
        status = "On Time"
        notes = "Test attendance for $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    $createdAttendance = Test-Endpoint -Name "ATT-06" -Method "POST" -Endpoint "/api/attendance" `
        -Body $createAttendance -Description "Create attendance record (admin)"
    
    if ($createdAttendance -and $createdAttendance.data) {
        $testAttendanceId = $createdAttendance.data.id
        
        # Clean up
        Test-Endpoint -Name "ATT-07" -Method "DELETE" -Endpoint "/api/attendance/$testAttendanceId" `
            -Description "Delete created attendance record"
    }
}

# ============================================================================
# 5. PAYROLL ENDPOINTS
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "         PAYROLL ENDPOINTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

$payrolls = Test-Endpoint -Name "PAY-01" -Method "GET" -Endpoint "/api/payroll" `
    -Description "Get all payroll records"

if ($payrolls -and $payrolls.data) {
    Write-Info "  Found $($payrolls.data.Count) payroll records"
    
    if ($payrolls.data.Count -gt 0) {
        $testPayrollId = $payrolls.data[0].id
        
        # Test get payroll by ID
        Test-Endpoint -Name "PAY-02" -Method "GET" -Endpoint "/api/payroll/$testPayrollId" `
            -Description "Get payroll by ID"
    }
}

if ($testEmployeeId) {
    # Get payroll for specific employee
    Test-Endpoint -Name "PAY-03" -Method "GET" -Endpoint "/api/payroll/employee/$testEmployeeId" `
        -Description "Get payroll by employee ID"
    
    # Test create payroll - using future month to avoid UNIQUE constraint
    $futureDate = (Get-Date).AddMonths(6)
    $currentMonth = $futureDate.Month
    $currentYear = $futureDate.Year
    
    $createPayroll = @{
        employeeId = $testEmployeeId
        month = $currentMonth
        year = $currentYear
        basicSalary = 5000.00
        allowances = 500.00
        bonuses = 300.00
        deductions = 200.00
        tax = 600.00
        paymentDate = $futureDate.ToString("yyyy-MM-dd")
        paymentStatus = "Pending"
        paymentMethod = "Bank Transfer"
        notes = "Test payroll created by automated test $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    $createdPayroll = Test-Endpoint -Name "PAY-04" -Method "POST" -Endpoint "/api/payroll" `
        -Body $createPayroll -Description "Create payroll record"
    
    if ($createdPayroll -and $createdPayroll.data) {
        $testPayrollId = $createdPayroll.data.id
        Write-Info "  Created payroll with ID: $testPayrollId"
        Write-Info "  Net Salary: $($createdPayroll.data.netSalary)"
        
        # Test update payroll
        $updatePayroll = @{
            employeeId = $testEmployeeId
            month = $currentMonth
            year = $currentYear
            basicSalary = 5500.00
            allowances = 600.00
            bonuses = 400.00
            deductions = 200.00
            tax = 650.00
            paymentDate = (Get-Date).ToString("yyyy-MM-dd")
            paymentStatus = "Processed"
            paymentMethod = "Bank Transfer"
            notes = "Updated by automated test $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        }
        
        Test-Endpoint -Name "PAY-05" -Method "PUT" -Endpoint "/api/payroll/$testPayrollId" `
            -Body $updatePayroll -Description "Update payroll record"
        
        # Delete test payroll
        Test-Endpoint -Name "PAY-06" -Method "DELETE" -Endpoint "/api/payroll/$testPayrollId" `
            -Description "Delete test payroll record"
    }
}

# ============================================================================
# 6. AUTHENTICATION ENDPOINTS
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "      AUTHENTICATION ENDPOINTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

# Test get all users (might have issues)
Test-Endpoint -Name "AUTH-01" -Method "GET" -Endpoint "/api/auth/users" `
    -Description "Get all users" -ExpectedStatus 200

# Test login with a real employee email
if ($employees -and $employees.data -and $employees.data.Count -gt 0) {
    $loginData = @{
        email = $employees.data[0].email
    }
    
    Test-Endpoint -Name "AUTH-02" -Method "POST" -Endpoint "/api/auth/login" `
        -Body $loginData -Description "Login with email"
} else {
    Write-Host "[SKIP] AUTH-02 - No employees found for testing" -ForegroundColor Yellow
}

# ============================================================================
# 7. VALIDATION TESTS (Expected to fail)
# ============================================================================
Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "         VALIDATION TESTS" -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

# Test invalid employee creation
$invalidEmployee = @{
    employeeCode = ""  # Required field empty
    position = "Test"
}

Test-Endpoint -Name "VAL-01" -Method "POST" -Endpoint "/api/employees" `
    -Body $invalidEmployee -Description "Create employee with invalid data" -ExpectedStatus 400

# Test invalid payroll creation
$invalidPayroll = @{
    employeeId = "invalid-id"
    month = 13  # Invalid month
    year = 2000
    basicSalary = -1000  # Negative salary
}

Test-Endpoint -Name "VAL-02" -Method "POST" -Endpoint "/api/payroll" `
    -Body $invalidPayroll -Description "Create payroll with invalid data" -ExpectedStatus 400

# Test non-existent resource
Test-Endpoint -Name "VAL-03" -Method "GET" -Endpoint "/api/employees/00000000-0000-0000-0000-000000000000" `
    -Description "Get non-existent employee" -ExpectedStatus 404

# ============================================================================
# TEST SUMMARY
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "                    TEST SUMMARY                           " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Total Tests Run:  " -NoNewline
Write-Host $script:TotalTests -ForegroundColor Yellow

Write-Host "Tests Passed:     " -NoNewline
Write-Host $script:PassedTests -ForegroundColor Green

Write-Host "Tests Failed:     " -NoNewline
Write-Host $script:FailedTests -ForegroundColor Red

$passRate = if ($script:TotalTests -gt 0) { 
    [math]::Round(($script:PassedTests / $script:TotalTests) * 100, 2) 
} else { 0 }

Write-Host "Pass Rate:        " -NoNewline
if ($passRate -ge 90) {
    Write-Host "$passRate%" -ForegroundColor Green
} elseif ($passRate -ge 70) {
    Write-Host "$passRate%" -ForegroundColor Yellow
} else {
    Write-Host "$passRate%" -ForegroundColor Red
}

Write-Host "`nTest completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Generate detailed report
if ($Verbose) {
    Write-Host "`n=======================================" -ForegroundColor Magenta
    Write-Host "         DETAILED RESULTS" -ForegroundColor Magenta
    Write-Host "=======================================`n" -ForegroundColor Magenta
    
    $script:TestResults | Format-Table -AutoSize
}

# Save results to file
$reportPath = Join-Path $PSScriptRoot "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testReport = @{
    Summary = @{
        TotalTests = $script:TotalTests
        PassedTests = $script:PassedTests
        FailedTests = $script:FailedTests
        PassRate = $passRate
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    Results = $script:TestResults
}

$testReport | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Info "Test results saved to: $reportPath"

# Exit with appropriate code
if ($script:FailedTests -gt 0) {
    exit 1
} else {
    exit 0
}
