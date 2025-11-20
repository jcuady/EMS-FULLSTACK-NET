Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  JWT AUTHENTICATION TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# Generate random email for this test run
$randomEmail = "test_$(Get-Random)@example.com"

Write-Host "Test 1: Register a new user" -ForegroundColor Yellow
$registerData = @{
    email = $randomEmail
    password = "password123"
    fullName = "Test User"
    role = "admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json"
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.data.token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "User: $($registerResponse.data.user.fullName) ($($registerResponse.data.user.email))" -ForegroundColor Gray
    $token = $registerResponse.data.token
    $refreshToken = $registerResponse.data.refreshToken
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nTest 2: Login with password" -ForegroundColor Yellow
$loginData = @{
    email = $randomEmail
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.data.token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "Expires: $($loginResponse.data.expiresAt)" -ForegroundColor Gray
    Write-Host "User: $($loginResponse.data.user.fullName) ($($loginResponse.data.user.role))" -ForegroundColor Gray
    $token = $loginResponse.data.token
    $refreshToken = $loginResponse.data.refreshToken
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nTest 3: Access protected endpoint with token" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Protected endpoint accessed!" -ForegroundColor Green
    Write-Host "Current user: $($meResponse.data.fullName)" -ForegroundColor Gray
    Write-Host "Email: $($meResponse.data.email)" -ForegroundColor Gray
    Write-Host "Role: $($meResponse.data.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to access protected endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest 4: Try invalid token" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token_here"
    }
    
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "❌ Should have failed with invalid token!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid token" -ForegroundColor Green
}

Write-Host "`nTest 5: Refresh token" -ForegroundColor Yellow
$refreshData = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" `
        -Method Post `
        -Body $refreshData `
        -ContentType "application/json"
    
    Write-Host "✅ Token refreshed successfully!" -ForegroundColor Green
    Write-Host "New Token: $($refreshResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Token refresh failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  JWT AUTHENTICATION TESTS COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
