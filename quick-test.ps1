# Quick API Test Script
$baseUrl = "http://localhost:5000"

Write-Host "Testing API endpoints..." -ForegroundColor Cyan

# Test 1: GET /api/employees (this works)
try {
    $employees = Invoke-RestMethod -Uri "$baseUrl/api/employees" -Method Get
    Write-Host "[PASS] GET /api/employees - Found $($employees.data.Count) employees" -ForegroundColor Green
    $testEmployeeId = $employees.data[0].id
    $testUserId = $employees.data[0].userId
} catch {
    Write-Host "[FAIL] GET /api/employees - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: GET /api/auth/users
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/api/auth/users" -Method Get
    Write-Host "[PASS] GET /api/auth/users - Found $($users.data.Count) users" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] GET /api/auth/users - $($_.Exception.Message)" -ForegroundColor Red
    try { $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json; Write-Host "  Error: $($errorDetails.message)" -ForegroundColor Yellow } catch {}
}

# Test 3: POST /api/auth/login
try {
    $loginData = @{ email = "john.doe@company.com" } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "[PASS] POST /api/auth/login - $($login.message)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] POST /api/auth/login - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: POST /api/employees (create new employee)
try {
    $newEmployee = @{
        userId = $testUserId
        employeeCode = "EMP-TEST-$(Get-Random -Maximum 9999)"
        position = "Test Engineer"
        employmentType = "Full-Time"
        hireDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        salary = 75000
        phone = "+1-555-TEST"
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod -Uri "$baseUrl/api/employees" -Method Post -Body $newEmployee -ContentType "application/json"
    Write-Host "[PASS] POST /api/employees - Created employee $($created.data.id)" -ForegroundColor Green
    $newEmployeeId = $created.data.id
    
    # Clean up - delete the test employee
    Invoke-RestMethod -Uri "$baseUrl/api/employees/$newEmployeeId" -Method Delete | Out-Null
    Write-Host "[INFO] Cleaned up test employee" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] POST /api/employees - $($_.Exception.Message)" -ForegroundColor Red
    try { $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json; Write-Host "  Error: $($errorDetails.message)" -ForegroundColor Yellow; if ($errorDetails.errors) { $errorDetails.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow } } } catch {}
}

# Test 5: POST /api/attendance/clock-in
try {
    $clockInData = @{
        employeeId = $testEmployeeId
        notes = "Test clock-in"
    } | ConvertTo-Json
    
    $clockIn = Invoke-RestMethod -Uri "$baseUrl/api/attendance/clock-in" -Method Post -Body $clockInData -ContentType "application/json"
    Write-Host "[PASS] POST /api/attendance/clock-in - $($clockIn.message)" -ForegroundColor Green
    $attendanceId = $clockIn.data.id
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/attendance/$attendanceId" -Method Delete | Out-Null
    Write-Host "[INFO] Cleaned up test attendance" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] POST /api/attendance/clock-in - $($_.Exception.Message)" -ForegroundColor Red
    try { $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json; Write-Host "  Error: $($errorDetails.message)" -ForegroundColor Yellow } catch {}
}

# Test 6: POST /api/attendance (admin create)
try {
    $createAttendance = @{
        employeeId = $testEmployeeId
        date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        clockIn = (Get-Date).AddHours(-8).ToString("yyyy-MM-ddTHH:mm:ss")
        clockOut = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        status = "Present"
        notes = "Test record"
    } | ConvertTo-Json
    
    $attendance = Invoke-RestMethod -Uri "$baseUrl/api/attendance" -Method Post -Body $createAttendance -ContentType "application/json"
    Write-Host "[PASS] POST /api/attendance - Created attendance $($attendance.data.id)" -ForegroundColor Green
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/attendance/$($attendance.data.id)" -Method Delete | Out-Null
    Write-Host "[INFO] Cleaned up test attendance" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] POST /api/attendance - $($_.Exception.Message)" -ForegroundColor Red
    try { $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json; Write-Host "  Error: $($errorDetails.message)" -ForegroundColor Yellow } catch {}
}

# Test 7: POST /api/payroll
try {
    $createPayroll = @{
        employeeId = $testEmployeeId
        month = (Get-Date).Month
        year = (Get-Date).Year
        basicSalary = 5000.00
        allowances = 500.00
        bonuses = 300.00
        deductions = 150.00
        tax = 750.00
        paymentStatus = "Pending"
        paymentMethod = "Bank Transfer"
        processedBy = "Test System"
    } | ConvertTo-Json
    
    $payroll = Invoke-RestMethod -Uri "$baseUrl/api/payroll" -Method Post -Body $createPayroll -ContentType "application/json"
    Write-Host "[PASS] POST /api/payroll - Created payroll $($payroll.data.id)" -ForegroundColor Green
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/payroll/$($payroll.data.id)" -Method Delete | Out-Null
    Write-Host "[INFO] Cleaned up test payroll" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] POST /api/payroll - $($_.Exception.Message)" -ForegroundColor Red
    try { $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json; Write-Host "  Error: $($errorDetails.message)" -ForegroundColor Yellow } catch {}
}

Write-Host "`nAll tests completed!" -ForegroundColor Cyan
