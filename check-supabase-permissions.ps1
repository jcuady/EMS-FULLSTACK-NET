# Check Supabase permissions and RLS policies
$env:SUPABASE_URL = "https://rdsjukksghhmacaftszv.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkc2p1a2tzZ2hobWFjYWZ0c3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjI2OTUsImV4cCI6MjA3ODYzODY5NX0.BLI7GUJcb6rGkxokHXyzAwxXxjDbIcSfasQhuLzGooQ"

$headers = @{
    "apikey" = $env:SUPABASE_KEY
    "Authorization" = "Bearer $env:SUPABASE_KEY"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "=== Testing Supabase Direct Access ===" -ForegroundColor Cyan

# Test 1: Try to INSERT into employees table
Write-Host "`n1. Testing INSERT into employees table..." -ForegroundColor Yellow
$newEmployee = @{
    user_id = "99999999-9999-9999-9999-999999999999"
    employee_code = "TESTDIRECT"
    department_id = "d1111111-1111-1111-1111-111111111111"
    position = "Test Direct"
    employment_type = "Permanent"
    hire_date = "2025-01-01"
    salary = 50000
    phone = "+1-555-0000"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$env:SUPABASE_URL/rest/v1/employees" -Method Post -Headers $headers -Body $newEmployee
    Write-Host "  SUCCESS: Direct INSERT works!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Try to INSERT into attendance table
Write-Host "`n2. Testing INSERT into attendance table..." -ForegroundColor Yellow
$newAttendance = @{
    employee_id = "14d73959-0a1d-4e8d-b9b6-97e1841c70a2"
    date = "2025-12-01"
    clock_in = "2025-12-01T09:00:00Z"
    clock_out = "2025-12-01T17:00:00Z"
    status = "On Time"
    notes = "Test direct insert"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$env:SUPABASE_URL/rest/v1/attendance" -Method Post -Headers $headers -Body $newAttendance
    Write-Host "  SUCCESS: Direct INSERT works!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Try to INSERT into payroll table
Write-Host "`n3. Testing INSERT into payroll table..." -ForegroundColor Yellow
$newPayroll = @{
    employee_id = "14d73959-0a1d-4e8d-b9b6-97e1841c70a2"
    month = 12
    year = 2025
    basic_salary = 50000
    allowances = 5000
    bonuses = 2500
    deductions = 1000
    tax = 7500
    net_salary = 49000
    payment_status = "Pending"
    payment_method = "Bank Transfer"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$env:SUPABASE_URL/rest/v1/payroll" -Method Post -Headers $headers -Body $newPayroll
    Write-Host "  SUCCESS: Direct INSERT works!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 4: Check if users table exists
Write-Host "`n4. Testing users table access..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$env:SUPABASE_URL/rest/v1/users?select=*&limit=1" -Method Get -Headers $headers
    Write-Host "  SUCCESS: Users table accessible!" -ForegroundColor Green
    Write-Host "  Found $($result.Count) users"
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "If all FAILED with 'new row violates row-level security policy'," -ForegroundColor Yellow
Write-Host "you need to disable RLS or add INSERT policies in Supabase." -ForegroundColor Yellow
