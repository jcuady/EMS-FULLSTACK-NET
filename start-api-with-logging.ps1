# Start API with logging to file
$logFile = "api-console-output.log"
Write-Host "Starting API and logging to $logFile..." -ForegroundColor Cyan

# Start API in background with output redirection
$job = Start-Job -ScriptBlock {
    Set-Location "C:\Users\joaxp\OneDrive\Documents\EMS"
    dotnet run --project EmployeeMvp.csproj --urls http://localhost:5000 2>&1
}

Write-Host "API started in background (Job ID: $($job.Id))" -ForegroundColor Green
Write-Host "Waiting 10 seconds for API to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test if API is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
    Write-Host "✓ API is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ API not responding yet..." -ForegroundColor Red
}

Write-Host "`nRunning test on ATT-03 (Clock-in)..." -ForegroundColor Cyan
$employees = Invoke-RestMethod -Uri "http://localhost:5000/api/employees" -Method Get
$employeeId = $employees.data[0].id
$body = @{ employeeId = $employeeId } | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/clock-in" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Wait a moment for logs to be written
Start-Sleep -Seconds 2

# Get job output
Write-Host "`n=== API Console Output (Last 50 lines) ===" -ForegroundColor Cyan
$output = Receive-Job -Job $job | Select-Object -Last 50
$output | ForEach-Object { Write-Host $_ }

# Save full output to file
Receive-Job -Job $job | Out-File -FilePath $logFile -Encoding UTF8
Write-Host "`nFull output saved to: $logFile" -ForegroundColor Green

Write-Host "`nKeeping API running. Job ID: $($job.Id)" -ForegroundColor Yellow
Write-Host "To stop: Stop-Job -Id $($job.Id); Remove-Job -Id $($job.Id)" -ForegroundColor Yellow
