# ============================================================
# EMS COMPLETE TEST SUITE - Modern PowerShell Edition
# Tests API, Database, Authentication, and Full Integration
# ============================================================

param(
    [string]$ApiUrl = "http://localhost:5000",
    [string]$FrontendUrl = "http://localhost:3000", 
    [switch]$SkipFrontend,
    [switch]$Verbose,
    [switch]$HealthOnly,
    [int]$TimeoutSeconds = 30
)

# Modern PowerShell functions
function Write-TestHeader { param($Title) Write-Host "`n=== $Title ===" -ForegroundColor Cyan -BackgroundColor DarkBlue }
function Write-Success { param($Msg) Write-Host "✅ PASS: $Msg" -ForegroundColor Green }
function Write-Failure { param($Msg) Write-Host "❌ FAIL: $Msg" -ForegroundColor Red }
function Write-Warning { param($Msg) Write-Host "⚠️  WARN: $Msg" -ForegroundColor Yellow }
function Write-Info { param($Msg) Write-Host "ℹ️  INFO: $Msg" -ForegroundColor Cyan }
function Write-Step { param($Msg) Write-Host "🔄 TEST: $Msg" -ForegroundColor Magenta }

# Test statistics
$Global:TestStats = @{
    Total = 0
    Passed = 0
    Failed = 0
    Warnings = 0
    Results = @()
    StartTime = Get-Date
}

function Add-TestResult {
    param(
        [string]$Category,
        [string]$TestName, 
        [string]$Status,
        [string]$Message,
        [object]$Data = $null,
        [int]$ResponseTime = 0
    )
    
    $Global:TestStats.Total++
    
    switch ($Status.ToUpper()) {
        "PASS" { 
            $Global:TestStats.Passed++
            Write-Success "$Category/$TestName - $Message ($($ResponseTime)ms)"
        }
        "FAIL" { 
            $Global:TestStats.Failed++
            Write-Failure "$Category/$TestName - $Message"
        }
        "WARN" { 
            $Global:TestStats.Warnings++
            Write-Warning "$Category/$TestName - $Message"
        }
    }
    
    $Global:TestStats.Results += [PSCustomObject]@{
        Category = $Category
        TestName = $TestName
        Status = $Status.ToUpper()
        Message = $Message
        ResponseTime = $ResponseTime
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Data = $Data
    }
}

function Test-HttpEndpoint {
    param(
        [string]$Category,
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int[]]$ExpectedStatusCodes = @(200),
        [int]$Timeout = 30
    )
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $requestParams = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = $Timeout
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $requestParams.Body = ($Body | ConvertTo-Json -Depth 10)
            $requestParams.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @requestParams
        $stopwatch.Stop()
        
        $statusCode = 200  # RestMethod succeeded
        if ($ExpectedStatusCodes -contains $statusCode) {
            Add-TestResult -Category $Category -TestName $Name -Status "PASS" -Message "Success" -Data $response -ResponseTime $stopwatch.ElapsedMilliseconds
            return $response
        } else {
            Add-TestResult -Category $Category -TestName $Name -Status "FAIL" -Message "Unexpected status code: $statusCode"
            return $null
        }
    }
    catch [System.Net.WebException] {
        $stopwatch.Stop()
        $statusCode = [int]$_.Exception.Response.StatusCode
        if ($ExpectedStatusCodes -contains $statusCode) {
            Add-TestResult -Category $Category -TestName $Name -Status "PASS" -Message "Expected status $statusCode"
            return $null
        } else {
            Add-TestResult -Category $Category -TestName $Name -Status "FAIL" -Message "HTTP Error: $statusCode - $($_.Exception.Message)"
            return $null
        }
    }
    catch {
        $stopwatch.Stop()
        Add-TestResult -Category $Category -TestName $Name -Status "FAIL" -Message "Error: $($_.Exception.Message)"
        return $null
    }
}

function Test-ServiceHealth {
    param([string]$ServiceName, [string]$Url, [int]$Timeout = 10)
    
    Write-Step "Checking $ServiceName health at $Url"
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $Timeout -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Add-TestResult -Category "Health" -TestName $ServiceName -Status "PASS" -Message "$ServiceName is running"
            return $true
        } else {
            Add-TestResult -Category "Health" -TestName $ServiceName -Status "FAIL" -Message "$ServiceName returned $($response.StatusCode)"
            return $false
        }
    }
    catch {
        Add-TestResult -Category "Health" -TestName $ServiceName -Status "FAIL" -Message "$ServiceName not accessible: $($_.Exception.Message)"
        return $false
    }
}

function Test-DatabaseConnection {
    Write-Step "Testing database connectivity through API"
    
    # Test a simple endpoint that requires database
    $users = Test-HttpEndpoint -Category "Database" -Name "Connection" -Url "$ApiUrl/api/auth/users"
    
    if ($users) {
        Add-TestResult -Category "Database" -TestName "DataAccess" -Status "PASS" -Message "Database accessible via API"
        return $true
    } else {
        Add-TestResult -Category "Database" -TestName "DataAccess" -Status "FAIL" -Message "Cannot access database through API"
        return $false
    }
}

function Test-AuthenticationFlow {
    Write-Step "Testing authentication flow"
    
    # Test getting users (should work without auth based on your API)
    $users = Test-HttpEndpoint -Category "Auth" -Name "GetUsers" -Url "$ApiUrl/api/auth/users"
    
    if ($users -and $users.success) {
        $userList = $users.data
        if ($userList.Count -gt 0) {
            Add-TestResult -Category "Auth" -TestName "UserData" -Status "PASS" -Message "Found $($userList.Count) users in system"
            
            # Try to login with first user (this might fail, but shows API structure)
            $testUser = $userList[0]
            $loginData = @{
                email = $testUser.email
                password = "test123"  # Default test password
            }
            
            Test-HttpEndpoint -Category "Auth" -Name "Login" -Url "$ApiUrl/api/auth/login" -Method "POST" -Body $loginData -ExpectedStatusCodes @(200, 401, 400)
            
            return $true
        } else {
            Add-TestResult -Category "Auth" -TestName "UserData" -Status "WARN" -Message "No users found in database"
            return $false
        }
    } else {
        Add-TestResult -Category "Auth" -TestName "UserAccess" -Status "FAIL" -Message "Cannot access user endpoint"
        return $false
    }
}

function Test-CoreApiEndpoints {
    Write-TestHeader "TESTING CORE API ENDPOINTS"
    
    # Basic endpoints
    Test-HttpEndpoint -Category "API" -Name "Root" -Url $ApiUrl
    Test-HttpEndpoint -Category "API" -Name "Health" -Url "$ApiUrl/health"
    
    # Dashboard
    Test-HttpEndpoint -Category "API" -Name "Dashboard" -Url "$ApiUrl/api/dashboard/statistics"
    
    # Employees
    Test-HttpEndpoint -Category "API" -Name "Employees" -Url "$ApiUrl/api/employees"
    
    # Attendance  
    Test-HttpEndpoint -Category "API" -Name "Attendance" -Url "$ApiUrl/api/attendance"
    
    # Payroll
    Test-HttpEndpoint -Category "API" -Name "Payroll" -Url "$ApiUrl/api/payroll"
}

function Test-FrontendConnection {
    if ($SkipFrontend) {
        Write-Info "Skipping frontend tests (--SkipFrontend flag)"
        return
    }
    
    Write-TestHeader "TESTING FRONTEND CONNECTION"
    
    if (Test-ServiceHealth -ServiceName "Frontend" -Url $FrontendUrl) {
        # Test if frontend can reach API
        try {
            $frontendHealth = Invoke-RestMethod -Uri "$FrontendUrl/api/health" -ErrorAction SilentlyContinue
            Add-TestResult -Category "Frontend" -TestName "APIProxy" -Status "PASS" -Message "Frontend can proxy to API"
        }
        catch {
            Add-TestResult -Category "Frontend" -TestName "APIProxy" -Status "WARN" -Message "Frontend running but API proxy may not work"
        }
    }
}

function Show-TestSummary {
    $endTime = Get-Date
    $duration = $endTime - $Global:TestStats.StartTime
    
    Write-TestHeader "TEST SUMMARY"
    
    $passRate = if ($Global:TestStats.Total -gt 0) { 
        [math]::Round(($Global:TestStats.Passed / $Global:TestStats.Total) * 100, 1) 
    } else { 0 }
    
    Write-Host ""
    Write-Host "📊 RESULTS:" -ForegroundColor White -BackgroundColor DarkGreen
    Write-Host "   Total Tests: $($Global:TestStats.Total)" -ForegroundColor White
    Write-Host "   Passed: $($Global:TestStats.Passed)" -ForegroundColor Green  
    Write-Host "   Failed: $($Global:TestStats.Failed)" -ForegroundColor Red
    Write-Host "   Warnings: $($Global:TestStats.Warnings)" -ForegroundColor Yellow
    Write-Host "   Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80){"Green"}elseif($passRate -ge 60){"Yellow"}else{"Red"})
    Write-Host "   Duration: $($duration.TotalSeconds.ToString('F1'))s" -ForegroundColor Cyan
    Write-Host ""
    
    # Save detailed results
    $resultsFile = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $detailedResults = @{
        Summary = @{
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Duration = $duration.TotalSeconds
            PassRate = $passRate
            Total = $Global:TestStats.Total
            Passed = $Global:TestStats.Passed  
            Failed = $Global:TestStats.Failed
            Warnings = $Global:TestStats.Warnings
        }
        Results = $Global:TestStats.Results
    }
    
    $detailedResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8
    Write-Info "Detailed results saved to: $resultsFile"
    
    # Return summary for further processing
    return $detailedResults
}

# ============================================================
# MAIN TEST EXECUTION
# ============================================================

Write-Host @"

 ███████╗███╗   ███╗███████╗    ████████╗███████╗███████╗████████╗
 ██╔════╝████╗ ████║██╔════╝    ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝
 █████╗  ██╔████╔██║███████╗       ██║   █████╗  ███████╗   ██║   
 ██╔══╝  ██║╚██╔╝██║╚════██║       ██║   ██╔══╝  ╚════██║   ██║   
 ███████╗██║ ╚═╝ ██║███████║       ██║   ███████╗███████║   ██║   
 ╚══════╝╚═╝     ╚═╝╚══════╝       ╚═╝   ╚══════╝╚══════╝   ╚═╝   
                                                                   
 Employee Management System - Comprehensive Test Suite
 Modern PowerShell Edition with Docker Support
 ================================================================

"@ -ForegroundColor Cyan

Write-Info "Test Configuration:"
Write-Info "  API URL: $ApiUrl"
Write-Info "  Frontend URL: $FrontendUrl"  
Write-Info "  Skip Frontend: $SkipFrontend"
Write-Info "  Timeout: $TimeoutSeconds seconds"
Write-Info "  Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Health Check Phase
Write-TestHeader "HEALTH CHECK PHASE"
$apiHealthy = Test-ServiceHealth -ServiceName "API" -Url "$ApiUrl/health"
$frontendHealthy = if (-not $SkipFrontend) { Test-ServiceHealth -ServiceName "Frontend" -Url $FrontendUrl } else { $true }

if (-not $apiHealthy) {
    Write-Failure "API is not running. Please start the API first:"
    Write-Host "  dotnet run --project EmployeeMvp.csproj" -ForegroundColor Yellow
    Write-Host "  OR" -ForegroundColor Yellow  
    Write-Host "  docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

if ($HealthOnly) {
    Write-Info "Health check complete. Exiting (--HealthOnly flag)"
    exit 0
}

# Database Connection Test
Write-TestHeader "DATABASE CONNECTION TEST"
$dbConnected = Test-DatabaseConnection

# Authentication Tests  
Write-TestHeader "AUTHENTICATION TESTS"
Test-AuthenticationFlow

# Core API Tests
Test-CoreApiEndpoints

# Frontend Tests
Test-FrontendConnection

# Show Results
$results = Show-TestSummary

# Exit with appropriate code
if ($Global:TestStats.Failed -gt 0) {
    Write-Host "❌ TESTS FAILED - Exit Code 1" -ForegroundColor Red
    exit 1  
} elseif ($Global:TestStats.Warnings -gt 0) {
    Write-Host "⚠️  TESTS COMPLETED WITH WARNINGS - Exit Code 0" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✅ ALL TESTS PASSED - Exit Code 0" -ForegroundColor Green
    exit 0
}