$body = @{
    email = "test.check@test.com"
    password = "Test@123"
    fullName = "Test Check"
    role = "employee"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Registration Check: SUCCESS" -ForegroundColor Green
    $response
} catch {
    Write-Host "Registration Check: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
        Write-Host "Details: $($reader.ReadToEnd())"
    }
}
