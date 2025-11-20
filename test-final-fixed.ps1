# EMS Final Comprehensive System Test
# Tests all components and generates status report

Write-Host "EMS Comprehensive System Test" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$results = @{
    "timestamp" = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    "overall_score" = 0
    "backend" = @{}
    "database" = @{}
    "frontend" = @{}
    "authentication" = @{}
}

$totalTests = 0
$passedTests = 0

# Test Backend API
Write-Host "Testing Backend API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 5
    $totalTests++
    if ($response) {
        $passedTests++
        Write-Host "SUCCESS Backend API is running" -ForegroundColor Green
        $results.backend.status = "running"
        $results.backend.health_check = "passed"
    }
} catch {
    Write-Host "ERROR Backend API not running" -ForegroundColor Red
    $results.backend.status = "not running"
    $results.backend.health_check = "failed"
    $totalTests++
}

# Test Database Connection via API
Write-Host "Testing Database Connection..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Get -TimeoutSec 10
    $totalTests++
    if ($response -and $response.Count -gt 0) {
        $passedTests++
        Write-Host "SUCCESS Database accessible with $($response.Count) users" -ForegroundColor Green
        $results.database.status = "accessible"
        $results.database.user_count = $response.Count
        $results.database.connection = "successful"
    } else {
        Write-Host "WARNING Database accessible but no users found" -ForegroundColor Yellow
        $results.database.status = "accessible"
        $results.database.user_count = 0
        $results.database.connection = "successful"
        $passedTests++
    }
} catch {
    Write-Host "ERROR Database not accessible" -ForegroundColor Red
    $results.database.status = "not accessible"
    $results.database.connection = "failed"
    $totalTests++
}

# Test Authentication Endpoint
Write-Host "Testing Authentication..." -ForegroundColor Yellow

try {
    $loginData = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginData -TimeoutSec 10
    $totalTests++
    if ($response.token) {
        $passedTests++
        Write-Host "SUCCESS Authentication working" -ForegroundColor Green
        $results.authentication.status = "working"
        $results.authentication.login_test = "passed"
    } else {
        Write-Host "ERROR Authentication failed - no token received" -ForegroundColor Red
        $results.authentication.status = "failed"
        $results.authentication.login_test = "failed"
    }
} catch {
    Write-Host "ERROR Authentication endpoint not working" -ForegroundColor Red
    $results.authentication.status = "endpoint error"
    $results.authentication.login_test = "failed"
    $totalTests++
}

# Test Frontend
Write-Host "Testing Frontend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    $totalTests++
    if ($response.StatusCode -eq 200) {
        $passedTests++
        Write-Host "SUCCESS Frontend is running" -ForegroundColor Green
        $results.frontend.status = "running"
        $results.frontend.accessibility = "accessible"
    }
} catch {
    Write-Host "ERROR Frontend not running" -ForegroundColor Red
    $results.frontend.status = "not running"
    $results.frontend.accessibility = "not accessible"
    $totalTests++
}

# Calculate overall score
if ($totalTests -gt 0) {
    $results.overall_score = [math]::Round(($passedTests / $totalTests) * 100, 1)
}

# Display Summary
Write-Host ""
Write-Host "SYSTEM STATUS SUMMARY" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Overall Score: $($results.overall_score)% ($passedTests/$totalTests tests passed)" -ForegroundColor $(if ($results.overall_score -ge 75) { "Green" } elseif ($results.overall_score -ge 50) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "Component Status:" -ForegroundColor White
Write-Host "- Backend API: $($results.backend.status)" -ForegroundColor $(if ($results.backend.status -eq "running") { "Green" } else { "Red" })
Write-Host "- Database: $($results.database.status)" -ForegroundColor $(if ($results.database.status -eq "accessible") { "Green" } else { "Red" })
Write-Host "- Frontend: $($results.frontend.status)" -ForegroundColor $(if ($results.frontend.status -eq "running") { "Green" } else { "Red" })
Write-Host "- Authentication: $($results.authentication.status)" -ForegroundColor $(if ($results.authentication.status -eq "working") { "Green" } else { "Red" })

# Generate recommendations
Write-Host ""
Write-Host "RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

if ($results.backend.status -ne "running") {
    Write-Host "1. Start the backend API with: dotnet run" -ForegroundColor Yellow
}

if ($results.database.status -ne "accessible") {
    Write-Host "2. Check Supabase connection and credentials" -ForegroundColor Yellow
}

if ($results.frontend.status -ne "running") {
    Write-Host "3. Start the frontend with: cd frontend && npm run dev" -ForegroundColor Yellow
}

if ($results.authentication.status -ne "working") {
    Write-Host "4. Set up user passwords in Supabase using add-passwords.sql" -ForegroundColor Yellow
}

# Save results to file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultsFile = "test-results-$timestamp.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8

Write-Host ""
Write-Host "Test results saved to: $resultsFile" -ForegroundColor Green
Write-Host "Test completed at: $(Get-Date)" -ForegroundColor Green