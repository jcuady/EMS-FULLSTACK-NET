# Master Test Script for Employee Management System
# This script validates the entire system flow from Auth to Payroll.

$BaseUrl = "http://localhost:5000/api"
$FrontendUrl = "http://localhost:3000"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Log-Info($message) { Write-Host "[INFO] $message" -ForegroundColor $Cyan }
function Log-Success($message) { Write-Host "[SUCCESS] $message" -ForegroundColor $Green }
function Log-Error($message) { Write-Host "[ERROR] $message" -ForegroundColor $Red }
function Log-Warn($message) { Write-Host "[WARN] $message" -ForegroundColor $Yellow }

# ---------------------------------------------------------------------------
# 1. Health Checks
# ---------------------------------------------------------------------------
Log-Info "--- Phase 1: Health Checks ---"

try {
    $backend = Invoke-WebRequest -Uri "$BaseUrl/health" -Method Get -ErrorAction Stop
    if ($backend.StatusCode -eq 200) { Log-Success "Backend is reachable" }
} catch {
    Log-Error "Backend is NOT reachable at $BaseUrl. Please start the backend."
    exit
}

try {
    $frontend = Invoke-WebRequest -Uri $FrontendUrl -Method Get -ErrorAction SilentlyContinue
    if ($frontend.StatusCode -eq 200) { Log-Success "Frontend is reachable" }
} catch {
    Log-Warn "Frontend is NOT reachable at $FrontendUrl. (This is okay for API testing)"
}

# ---------------------------------------------------------------------------
# 2. Authentication & User Setup
# ---------------------------------------------------------------------------
Log-Info "`n--- Phase 2: Authentication & User Setup ---"

$AdminEmail = "master_admin@test.com"
$HREmail = "master_hr@test.com"
$EmpEmail = "master_emp@test.com"
$Password = "Test@123"

function Register-User($email, $name, $role) {
    $body = @{
        email = $email
        password = $Password
        fullName = $name
        role = $role
        avatarUrl = "https://ui-avatars.com/api/?name=$name"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
        if ($response.success) {
            Log-Success "Registered ${role}: $email"
            return $response.data
        } else {
            # If already exists, try login
            Log-Warn "User $email might already exist. Attempting login..."
            return $null
        }
    } catch {
        Log-Warn "Registration failed (User likely exists). Proceeding to login."
        return $null
    }
}

function Login-User($email) {
    $body = @{
        email = $email
        password = $Password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        if ($response.success) {
            Log-Success "Logged in as $email"
            return $response.data
        }
    } catch {
        Log-Error "Login failed for $email. Please check database or restart."
        Write-Host $_
        exit
    }
}

# Register Users
$AdminData = Register-User $AdminEmail "Master Admin" "Admin"
$HRData = Register-User $HREmail "Master HR" "Manager"
$EmpData = Register-User $EmpEmail "Master Employee" "Employee"

# Login and Get Tokens
$AdminLogin = Login-User $AdminEmail
$HRLogin = Login-User $HREmail
$EmpLogin = Login-User $EmpEmail

$AdminToken = $AdminLogin.token
$HRToken = $HRLogin.token
$EmpToken = $EmpLogin.token
$EmpUserId = $EmpLogin.user.id

$AdminHeaders = @{ Authorization = "Bearer $AdminToken" }
$HRHeaders = @{ Authorization = "Bearer $HRToken" }
$EmpHeaders = @{ Authorization = "Bearer $EmpToken" }

# ---------------------------------------------------------------------------
# 3. Employee Management (Admin)
# ---------------------------------------------------------------------------
Log-Info "`n--- Phase 3: Employee Management ---"

# Check if employee profile exists for the test user
try {
    $checkEmp = Invoke-RestMethod -Uri "$BaseUrl/employees/user/$EmpUserId" -Method Get -Headers $AdminHeaders -ErrorAction SilentlyContinue
    if ($checkEmp.success) {
        Log-Warn "Employee profile already exists for $EmpEmail"
        $EmployeeId = $checkEmp.data.id
    }
} catch {
    Log-Info "Creating new employee profile for $EmpEmail..."
    
    $EmpCode = "EMP" + (Get-Random -Minimum 1000 -Maximum 9999)
    $createEmpBody = @{
        userId = $EmpUserId
        employeeCode = $EmpCode
        departmentId = 1 # Assuming Dept 1 exists
        position = "Software Engineer"
        employmentType = "FullTime"
        hireDate = (Get-Date).ToString("yyyy-MM-dd")
        salary = 75000
        phone = "555-0123"
        address = "123 Tech Lane"
        emergencyContact = "Jane Doe"
        emergencyPhone = "555-9999"
        dateOfBirth = "1990-01-01"
        gender = "Male"
        performanceRating = 5
    } | ConvertTo-Json

    try {
        $newEmp = Invoke-RestMethod -Uri "$BaseUrl/employees" -Method Post -Headers $AdminHeaders -Body $createEmpBody -ContentType "application/json"
        if ($newEmp.success) {
            Log-Success "Created Employee Profile: $($newEmp.data.employeeCode)"
            $EmployeeId = $newEmp.data.id
        }
    } catch {
        Log-Error "Failed to create employee profile"
        Write-Host $_
    }
}

# ---------------------------------------------------------------------------
# 4. Attendance (Employee)
# ---------------------------------------------------------------------------
Log-Info "`n--- Phase 4: Attendance ---"

# Clock In
$clockInBody = @{
    latitude = 40.7128
    longitude = -74.0060
    deviceInfo = "PowerShell Test Script"
    notes = "Automated Test Clock In"
} | ConvertTo-Json

try {
    $clockIn = Invoke-RestMethod -Uri "$BaseUrl/attendance/clock-in" -Method Post -Headers $EmpHeaders -Body $clockInBody -ContentType "application/json" -ErrorAction SilentlyContinue
    if ($clockIn.success) {
        Log-Success "Clocked In Successfully"
    }
} catch {
    Log-Warn "Clock In failed (User might already be clocked in)"
}

# Clock Out (Wait 2 seconds to have duration)
Start-Sleep -Seconds 2

$clockOutBody = @{
    latitude = 40.7128
    longitude = -74.0060
    notes = "Automated Test Clock Out"
} | ConvertTo-Json

try {
    $clockOut = Invoke-RestMethod -Uri "$BaseUrl/attendance/clock-out" -Method Post -Headers $EmpHeaders -Body $clockOutBody -ContentType "application/json" -ErrorAction SilentlyContinue
    if ($clockOut.success) {
        Log-Success "Clocked Out Successfully"
    }
} catch {
    Log-Warn "Clock Out failed (User might not be clocked in)"
}

# ---------------------------------------------------------------------------
# 5. Leave Management (Employee Request -> HR Approve)
# ---------------------------------------------------------------------------
Log-Info "`n--- Phase 5: Leave Management ---"

# Request Leave
$leaveBody = @{
    leaveType = "Annual"
    startDate = (Get-Date).AddDays(5).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    reason = "Vacation Test"
} | ConvertTo-Json

try {
    $leaveReq = Invoke-RestMethod -Uri "$BaseUrl/leave" -Method Post -Headers $EmpHeaders -Body $leaveBody -ContentType "application/json"
    if ($leaveReq.success) {
        Log-Success "Leave Requested: ID $($leaveReq.data.id)"
        $LeaveId = $leaveReq.data.id
        
        # Approve Leave (HR)
        $approveBody = @{
            status = "Approved"
            comments = "Approved by AutoTest"
        } | ConvertTo-Json
        
        $approve = Invoke-RestMethod -Uri "$BaseUrl/leave/$LeaveId/status" -Method Put -Headers $HRHeaders -Body $approveBody -ContentType "application/json"
        if ($approve.success) {
            Log-Success "Leave Approved by HR"
        }
    }
} catch {
    Log-Error "Leave Request Failed"
    Write-Host $_
}

# ---------------------------------------------------------------------------
# 6. Payroll (HR)
# ---------------------------------------------------------------------------
Log-Info "`n--- Phase 6: Payroll ---"

if ($EmployeeId) {
    $payrollBody = @{
        employeeId = $EmployeeId
        payPeriodStart = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
        payPeriodEnd = (Get-Date).ToString("yyyy-MM-dd")
        paymentDate = (Get-Date).ToString("yyyy-MM-dd")
        bonus = 500
        deductions = 100
        notes = "Test Payroll"
    } | ConvertTo-Json

    try {
        $payroll = Invoke-RestMethod -Uri "$BaseUrl/payroll/generate" -Method Post -Headers $HRHeaders -Body $payrollBody -ContentType "application/json"
        if ($payroll.success) {
            Log-Success "Payroll Generated: Net Salary $($payroll.data.netSalary)"
        }
    } catch {
        Log-Error "Payroll Generation Failed"
        Write-Host $_
    }
} else {
    Log-Warn "Skipping Payroll (No Employee ID)"
}

# ---------------------------------------------------------------------------
# 7. Dashboard & Reports (Admin)
# ---------------------------------------------------------------------------
Log-Info "`n--- Phase 7: Dashboard & Reports ---"

try {
    $stats = Invoke-RestMethod -Uri "$BaseUrl/dashboard/stats" -Method Get -Headers $AdminHeaders
    if ($stats.success) {
        Log-Success "Dashboard Stats Retrieved"
        Write-Host "   Total Employees: $($stats.data.totalEmployees)" -ForegroundColor Gray
        Write-Host "   Active Now: $($stats.data.activeEmployees)" -ForegroundColor Gray
    }
} catch {
    Log-Error "Failed to fetch Dashboard Stats"
}

Log-Info "`n--- Test Complete ---"
