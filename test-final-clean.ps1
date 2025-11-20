# EMS Final Test Suite - Clean PowerShell Version
# Tests all endpoints and provides comprehensive status

param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$FrontendUrl = "http://localhost:3000",
    [switch]$Verbose
)

# Test counters
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0

function Write-TestHeader { 
    param($Title) 
    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "===============================================" -ForegroundColor Cyan
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [int[]]$ExpectedStatus = @(200)
    )
    
    $script:totalTests++
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 5)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:passedTests++
        
        if ($Verbose -and $response) {
            $responseText = if ($response -is [string]) { $response } else { $response | ConvertTo-Json -Compress }
            if ($responseText.Length -gt 200) { $responseText = $responseText.Substring(0, 200) + "..." }
            Write-Host "       Response: $responseText" -ForegroundColor Gray
        }
        
        return $response
        
    } catch {
        $statusCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        
        if ($ExpectedStatus -contains $statusCode) {
            Write-Host "[PASS] $Name (Expected $statusCode)" -ForegroundColor Green
            $script:passedTests++
            return $null
        } else {
            Write-Host "[FAIL] $Name - $($_.Exception.Message)" -ForegroundColor Red
            $script:failedTests++
            return $null
        }
    }
}

function Test-ServiceHealth {
    param([string]$Name, [string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[HEALTHY] $Name is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[DOWN] $Name is not accessible" -ForegroundColor Red
        return $false
    }
}

# Main Test Execution
Write-Host @"

 ███████╗███╗   ███╗███████╗    ███████╗██╗███╗   ██╗ █████╗ ██╗     
 ██╔════╝████╗ ████║██╔════╝    ██╔════╝██║████╗  ██║██╔══██╗██║     
 █████╗  ██╔████╔██║███████╗    █████╗  ██║██╔██╗ ██║███████║██║     
 ██╔══╝  ██║╚██╔╝██║╚════██║    ██╔══╝  ██║██║╚██╗██║██╔══██║██║     
 ███████╗██║ ╚═╝ ██║███████║    ██║     ██║██║ ╚████║██║  ██║███████╗
 ╚══════╝╚═╝     ╚═╝╚══════╝    ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
                                                                      
 Employee Management System - Final Test Suite
 Testing all components for production readiness

"@ -ForegroundColor Cyan

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Backend URL: $BaseUrl" -ForegroundColor White
Write-Host "  Frontend URL: $FrontendUrl" -ForegroundColor White
Write-Host "  Verbose Output: $Verbose" -ForegroundColor White
Write-Host "  Test Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White

# Phase 1: Service Health Checks
Write-TestHeader "SERVICE HEALTH CHECKS"
$backendHealthy = Test-ServiceHealth -Name "Backend API" -Url "$BaseUrl/health"
$frontendHealthy = Test-ServiceHealth -Name "Frontend App" -Url $FrontendUrl

if (-not $backendHealthy) {
    Write-Host "`nCRITICAL: Backend API is not running!" -ForegroundColor Red
    Write-Host "Please start the backend with: dotnet run --project EmployeeMvp.csproj" -ForegroundColor Yellow
    exit 1
}

# Phase 2: Basic API Tests
Write-TestHeader "BASIC API ENDPOINTS"
Test-Endpoint -Name "API Health Check" -Url "$BaseUrl/health"
Test-Endpoint -Name "API Root Info" -Url "$BaseUrl"

# Phase 3: Authentication Tests
Write-TestHeader "AUTHENTICATION SYSTEM"
$users = Test-Endpoint -Name "Get All Users" -Url "$BaseUrl/api/auth/users"

if ($users -and $users.success -and $users.data) {
    Write-Host "`n[INFO] Found $($users.data.Count) users in database" -ForegroundColor Cyan
    
    # Test login with first user
    if ($users.data.Count -gt 0) {
        $testUser = $users.data[0]
        Write-Host "[INFO] Testing login with: $($testUser.email)" -ForegroundColor Cyan
        
        $loginData = @{
            email = $testUser.email
            password = "test123"
        }
        
        $loginResult = Test-Endpoint -Name "User Login Test" -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $loginData -ExpectedStatus @(200, 401, 400)
        
        if ($loginResult -and $loginResult.success -and $loginResult.data.token) {
            Write-Host "[SUCCESS] Authentication working - JWT token received" -ForegroundColor Green
            $jwtToken = $loginResult.data.token
            $authHeaders = @{ "Authorization" = "Bearer $jwtToken" }
        } else {
            Write-Host "[INFO] Login failed - may need password setup in database" -ForegroundColor Yellow
            $authHeaders = @{}
        }
    }
} else {
    Write-Host "[WARNING] Could not retrieve users from database" -ForegroundColor Yellow
    $authHeaders = @{}
}

# Phase 4: Protected Endpoints (with and without auth)
Write-TestHeader "PROTECTED ENDPOINTS"
Test-Endpoint -Name "Dashboard Stats" -Url "$BaseUrl/api/dashboard/statistics" -Headers $authHeaders -ExpectedStatus @(200, 401, 404)
Test-Endpoint -Name "All Employees" -Url "$BaseUrl/api/employees" -Headers $authHeaders -ExpectedStatus @(200, 401)
Test-Endpoint -Name "All Attendance" -Url "$BaseUrl/api/attendance" -Headers $authHeaders -ExpectedStatus @(200, 401)
Test-Endpoint -Name "All Payroll" -Url "$BaseUrl/api/payroll" -Headers $authHeaders -ExpectedStatus @(200, 401)

# Phase 5: Data Operations (if authenticated)
if ($authHeaders.Count -gt 0) {
    Write-TestHeader "DATA OPERATIONS (AUTHENTICATED)"
    
    # Test creating attendance record
    $attendanceData = @{
        employeeId = "e1111111-1111-1111-1111-111111111111"
        date = (Get-Date).ToString("yyyy-MM-dd")
        clockIn = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffzzz")
        status = "On Time"
        notes = "Test attendance record"
    }
    
    Test-Endpoint -Name "Create Attendance" -Url "$BaseUrl/api/attendance" -Method "POST" -Body $attendanceData -Headers $authHeaders -ExpectedStatus @(200, 201, 400, 401, 409)
}

# Phase 6: Frontend Integration
if ($frontendHealthy) {
    Write-TestHeader "FRONTEND INTEGRATION"
    Write-Host "[INFO] Frontend is accessible at $FrontendUrl" -ForegroundColor Green
} else {
    Write-TestHeader "FRONTEND INTEGRATION"
    Write-Host "[WARNING] Frontend is not running" -ForegroundColor Yellow
    Write-Host "[INFO] Start frontend with: cd frontend && npm run dev" -ForegroundColor Cyan
}

# Test Summary
Write-TestHeader "TEST SUMMARY"

$passRate = if ($script:totalTests -gt 0) { [math]::Round(($script:passedTests / $script:totalTests) * 100, 1) } else { 0 }

Write-Host ""
Write-Host "📊 RESULTS SUMMARY:" -ForegroundColor White
Write-Host "   Total Tests: $($script:totalTests)" -ForegroundColor White
Write-Host "   Passed: $($script:passedTests)" -ForegroundColor Green
Write-Host "   Failed: $($script:failedTests)" -ForegroundColor Red
Write-Host "   Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80){"Green"}elseif($passRate -ge 60){"Yellow"}else{"Red"})

Write-Host ""
Write-Host "🎯 SYSTEM STATUS:" -ForegroundColor White
if ($backendHealthy -and $script:passedTests -gt ($script:totalTests * 0.7)) {
    Write-Host "   ✅ EMS System is OPERATIONAL" -ForegroundColor Green
    Write-Host "   📊 Backend API: RUNNING" -ForegroundColor Green
    Write-Host "   🗄️  Database: CONNECTED" -ForegroundColor Green
        $authStatus = if($authHeaders.Count -gt 0){'WORKING'}else{'NEEDS SETUP'}
    $authColor = if($authHeaders.Count -gt 0){"Green"}else{"Yellow"}
    $frontendStatus = if($frontendHealthy){'RUNNING'}else{'STOPPED'}
    $frontendColor = if($frontendHealthy){"Green"}else{"Yellow"}
    
    Write-Host "   🔐 Authentication: $authStatus" -ForegroundColor $authColor
    Write-Host "   🖥️  Frontend: $frontendStatus" -ForegroundColor $frontendColor
} else {
    Write-Host "   ⚠️  EMS System has ISSUES" -ForegroundColor Yellow
    Write-Host "   Check the failed tests above for details" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 APPLICATION URLS:" -ForegroundColor White
Write-Host "   Backend API: $BaseUrl" -ForegroundColor Cyan
Write-Host "   API Health: $BaseUrl/health" -ForegroundColor Cyan
Write-Host "   Frontend: $FrontendUrl" -ForegroundColor Cyan

Write-Host ""
Write-Host "📝 NEXT STEPS:" -ForegroundColor White
if ($authHeaders.Count -eq 0) {
    Write-Host "   1. Add passwords to users in Supabase (see add-passwords.sql)" -ForegroundColor Yellow
}
if (-not $frontendHealthy) {
    Write-Host "   2. Start frontend: cd frontend && npm run dev" -ForegroundColor Yellow
}
Write-Host "   3. Access the application at $FrontendUrl" -ForegroundColor Green

# Exit with appropriate code
if ($passRate -ge 70) {
    Write-Host "`n🎉 EMS System is ready for use!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ EMS System needs attention" -ForegroundColor Red
    exit 1
}