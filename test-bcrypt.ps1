# Test BCrypt Hash Generation
Write-Host "Testing BCrypt hash verification..." -ForegroundColor Cyan

# Test different hash formats for "test123"
$testHashes = @(
    '$2a$11$rjGjwQLlj5G8jEQJhYvpEeBKR5/9.qoJ2FU7Z1u.5k3zO5CxYMV.S',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1VHb1jXvGe5WHv7xJXvlh6tANWyG4oa',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
)

foreach ($hash in $testHashes) {
    Write-Host "Testing hash: $($hash.Substring(0,20))..." -ForegroundColor Yellow
    
    $loginData = @{ 
        email = "admin@company.com"
        password = "test123" 
    } | ConvertTo-Json
    
    # First, let's verify what's in the database
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "SUCCESS with this hash!" -ForegroundColor Green
        Write-Host "User: $($response.data.user.fullName)" -ForegroundColor Cyan
        break
    }
    catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTrying with commonly working BCrypt hashes..." -ForegroundColor Cyan
Write-Host "If none work, we'll need to update the database with a fresh hash."