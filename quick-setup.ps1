# Quick user creation and test script
Write-Host "Setting up users..." -ForegroundColor Cyan

# Bypass SSL certificate validation for localhost
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

$users = @(
    @{ email = "admin@test.com"; password = "Admin@123"; fullName = "System Administrator"; role = "Admin" },
    @{ email = "hr@test.com"; password = "Hr@123"; fullName = "HR Manager"; role = "HR" },
    @{ email = "employee@test.com"; password = "Employee@123"; fullName = "John Employee"; role = "Employee" }
)

foreach ($user in $users) {
    try {
        $body = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
        Write-Host "[OK] Created: $($user.email)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "[OK] Exists: $($user.email)" -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] $($user.email): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nTesting login..." -ForegroundColor Cyan
$loginBody = @{ email = "admin@test.com"; password = "Admin@123" } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "[SUCCESS] Login worked!" -ForegroundColor Green
    Write-Host "User: $($response.user.fullName) | Role: $($response.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "[FAIL] Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
