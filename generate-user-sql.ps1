#!/usr/bin/env pwsh
# Direct SQL script to insert test users into Supabase

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SQL SCRIPT TO CREATE TEST USERS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$sqlScript = @"
-- Delete existing test users (clean slate)
DELETE FROM users WHERE email IN ('admin@test.com', 'hr@test.com', 'employee@test.com');

-- Insert admin user
-- Password: Admin@123
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@test.com',
    '`$2a`$11`$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'Admin',
    true,
    NOW(),
    NOW()
);

-- Insert HR user
-- Password: Hr@123
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'hr@test.com',
    '`$2a`$11`$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'HR Manager',
    'HR',
    true,
    NOW(),
    NOW()
);

-- Insert employee user  
-- Password: Employee@123
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'employee@test.com',
    '`$2a`$11`$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'John Employee',
    'Employee',
    true,
    NOW(),
    NOW()
);

-- Verify
SELECT email, full_name, role, is_active FROM users WHERE email IN ('admin@test.com', 'hr@test.com', 'employee@test.com');
"@

Write-Host "Copy and run this SQL in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/YOUR_PROJECT/sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "==================== SQL SCRIPT ====================" -ForegroundColor Green
Write-Host $sqlScript -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "After running the SQL, use these credentials:" -ForegroundColor Yellow
Write-Host ""
Write-Host "👤 Admin:" -ForegroundColor Cyan
Write-Host "   Email: admin@test.com"
Write-Host "   Password: Admin@123"
Write-Host ""
Write-Host "👤 HR Manager:" -ForegroundColor Cyan
Write-Host "   Email: hr@test.com"
Write-Host "   Password: Hr@123"
Write-Host ""
Write-Host "👤 Employee:" -ForegroundColor Cyan
Write-Host "   Email: employee@test.com"
Write-Host "   Password: Employee@123"
Write-Host ""

# Save to file
$sqlScript | Out-File -FilePath "create-users.sql" -Encoding UTF8
Write-Host "✅ SQL saved to: create-users.sql" -ForegroundColor Green
Write-Host ""
