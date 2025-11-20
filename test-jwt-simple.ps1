# Script to update existing users with password hashes

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  JWT AUTHENTICATION - Quick Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# Test login with the newly registered user
Write-Host "Testing login with test user..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "`n✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "`n📊 Response Details:" -ForegroundColor Cyan
    Write-Host "User: $($response.data.user.fullName)" -ForegroundColor White
    Write-Host "Email: $($response.data.user.email)" -ForegroundColor White
    Write-Host "Role: $($response.data.user.role)" -ForegroundColor White
    Write-Host "Token: $($response.data.token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "Expires At: $($response.data.expiresAt)" -ForegroundColor Gray
    Write-Host "Refresh Token: $($response.data.refreshToken.Substring(0, 20))..." -ForegroundColor Gray
    
    # Test accessing protected endpoint
    Write-Host "`n🔐 Testing protected endpoint..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $($response.data.token)"
    }
    
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Protected endpoint accessed successfully!" -ForegroundColor Green
    Write-Host "Current User: $($meResponse.data.fullName) ($($meResponse.data.email))" -ForegroundColor White
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  ✅ JWT AUTHENTICATION WORKING!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`n❌ Error: $statusCode" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($statusCode -eq 401) {
        Write-Host "`n💡 Note: Password verification failed." -ForegroundColor Cyan
        Write-Host "The user was registered but BCrypt hash verification might have an issue." -ForegroundColor Gray
    }
}
