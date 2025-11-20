# Quick Setup Script - Creates test admin user
# Run this ONCE before running the complete test suite

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SETUP: Create Test Admin User" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script helps you set up a test admin user for testing.`n" -ForegroundColor Yellow

Write-Host "SQL to run in Supabase SQL Editor:`n" -ForegroundColor White

$sql = @"
-- Create test admin user in auth.users table
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
)
VALUES (
    gen_random_uuid(),
    'admin@test.com',
    crypt('Admin@123', gen_salt('bf')),  -- Hashed password
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test Admin"}',
    false,
    'authenticated'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Create corresponding user record in public.users
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    created_at
)
SELECT
    id,
    'admin@test.com',
    'Test Admin',
    'admin',
    NOW()
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (email) DO NOTHING;

-- Create employee record for the admin
INSERT INTO public.employees (
    id,
    user_id,
    employee_code,
    department_id,
    position,
    salary,
    hire_date,
    employment_status,
    created_at
)
SELECT
    gen_random_uuid(),
    u.id,
    'EMP001',
    (SELECT id FROM public.departments LIMIT 1),
    'System Administrator',
    100000,
    NOW(),
    'Active',
    NOW()
FROM public.users u
WHERE u.email = 'admin@test.com'
ON CONFLICT (employee_code) DO NOTHING;

-- Create initial leave balance for admin (current year)
INSERT INTO public.leave_balances (
    id,
    employee_id,
    year,
    annual_leave,
    sick_leave,
    personal_leave,
    used_annual,
    used_sick,
    used_personal
)
SELECT
    gen_random_uuid(),
    e.id,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    21,  -- 21 days annual leave
    10,  -- 10 days sick leave
    5,   -- 5 days personal leave
    0,   -- No days used yet
    0,
    0
FROM public.employees e
JOIN public.users u ON e.user_id = u.id
WHERE u.email = 'admin@test.com'
ON CONFLICT (employee_id, year) DO NOTHING;
"@

Write-Host $sql -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Copy the SQL above" -ForegroundColor Yellow
Write-Host "2. Go to your Supabase Dashboard" -ForegroundColor Yellow
Write-Host "3. Open SQL Editor" -ForegroundColor Yellow
Write-Host "4. Paste and run the SQL" -ForegroundColor Yellow
Write-Host "5. Run the test suite: .\run-complete-tests.ps1`n" -ForegroundColor Yellow

Write-Host "Test Credentials:" -ForegroundColor White
Write-Host "  Email: admin@test.com" -ForegroundColor Gray
Write-Host "  Password: Admin@123`n" -ForegroundColor Gray

Write-Host "After setup, the complete test suite will test:" -ForegroundColor White
Write-Host "  - Authentication (Login/Logout)" -ForegroundColor Gray
Write-Host "  - Employee Management" -ForegroundColor Gray
Write-Host "  - Attendance Tracking" -ForegroundColor Gray
Write-Host "  - Payroll Processing" -ForegroundColor Gray
Write-Host "  - Leave Management" -ForegroundColor Gray
Write-Host "  - Reports Generation (PDF/Excel)" -ForegroundColor Gray
Write-Host "  - Notifications" -ForegroundColor Gray
Write-Host "  - Audit Logging" -ForegroundColor Gray
Write-Host "  - Dashboard Statistics`n" -ForegroundColor Gray
