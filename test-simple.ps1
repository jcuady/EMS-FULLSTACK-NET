# Simple EMS Test Script - Clean Version
param(
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$Verbose
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    EMS API TEST SUITE - CLEAN VERSION" -ForegroundColor Cyan  
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$totalTests = 0
$passedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    $global:totalTests++
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "[PASS] $Name" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        
        $global:passedTests++
        $global:testResults += @{ Test = $Name; Status = "PASS"; Message = "Success" }
        return $response
        
    } catch {
        Write-Host "[FAIL] $Name - $($_.Exception.Message)" -ForegroundColor Red
        $global:testResults += @{ Test = $Name; Status = "FAIL"; Message = $_.Exception.Message }
        return $null
    }
}

Write-Host "Testing API at: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "=== HEALTH TESTS ===" -ForegroundColor Cyan
Test-Endpoint -Name "API Health" -Url "$BaseUrl/health"
Test-Endpoint -Name "API Root" -Url "$BaseUrl"

# Test 2: Authentication
Write-Host ""
Write-Host "=== AUTHENTICATION TESTS ===" -ForegroundColor Cyan
$users = Test-Endpoint -Name "Get Users" -Url "$BaseUrl/api/auth/users"

if ($users -and $users.success -and $users.data) {
    Write-Host "[INFO] Found $($users.data.Count) users in database" -ForegroundColor Cyan
    
    if ($users.data.Count -gt 0) {
        $testUser = $users.data[0]
        Write-Host "[INFO] Testing login with user: $($testUser.email)" -ForegroundColor Cyan
        
        $loginData = @{
            email = $testUser.email
            password = "test123"
        }
        
        Test-Endpoint -Name "Login Test" -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $loginData
    }
}

# Test 3: Core API Endpoints  
Write-Host ""
Write-Host "=== CORE API TESTS ===" -ForegroundColor Cyan
Test-Endpoint -Name "Dashboard Stats" -Url "$BaseUrl/api/dashboard/statistics"
Test-Endpoint -Name "All Employees" -Url "$BaseUrl/api/employees"
Test-Endpoint -Name "All Attendance" -Url "$BaseUrl/api/attendance"
Test-Endpoint -Name "All Payroll" -Url "$BaseUrl/api/payroll"

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "             TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80){"Green"}else{"Yellow"})

Write-Host ""
if ($passedTests -eq $totalTests) {
    Write-Host "[SUCCESS] All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[WARNING] Some tests failed" -ForegroundColor Yellow
    exit 1
}