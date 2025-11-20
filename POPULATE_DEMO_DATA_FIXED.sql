-- ============================================================
-- WORKING DEMO DATA FOR EMS APPLICATION
-- Run this SQL in Supabase SQL Editor to populate realistic demo data
-- Updated: November 20, 2025 - Fixed UUID format issues
-- ============================================================

-- IMPORTANT: This script uses the actual demo user IDs that you confirmed work
-- Admin: efef99b2-4e4b-478b-8450-4951303271a6 (demo.admin@company.com)
-- Manager: 9a193729-489e-4ab9-99ea-72f4a672ce9c (demo.manager@company.com)  
-- Employee: 9bc261c0-3feb-4dcd-b1ef-562821c0c0ed (demo.employee@company.com)

-- Step 1: Create departments
INSERT INTO public.departments (id, name, description, manager_id, created_at, updated_at) 
VALUES
(gen_random_uuid(), 'Engineering', 'Software Development and IT Operations', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Human Resources', 'Employee Relations and Talent Management', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Marketing', 'Digital Marketing and Brand Management', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Finance', 'Accounting and Financial Planning', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Operations', 'Business Operations and Support', NULL, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create employee records for our demo users
INSERT INTO public.employees (
    id, employee_code, user_id, department_id, position, hire_date, 
    salary, employment_type, status, performance_rating, created_at, updated_at
) VALUES
-- Demo Admin Employee Record
(
    gen_random_uuid(),
    'EMP001', 
    'efef99b2-4e4b-478b-8450-4951303271a6',  -- Admin Demo User ID
    (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1),
    'Chief Technology Officer',
    '2022-01-15',
    120000.00,
    'Permanent',
    'active',
    4.8,
    NOW(),
    NOW()
),

-- Demo Manager Employee Record  
(
    gen_random_uuid(),
    'EMP002',
    '9a193729-489e-4ab9-99ea-72f4a672ce9c',  -- Manager Demo User ID
    (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1),
    'HR Manager',
    '2022-03-20',
    85000.00,
    'Permanent', 
    'active',
    4.5,
    NOW(),
    NOW()
),

-- Demo Employee Record
(
    gen_random_uuid(),
    'EMP003',
    '9bc261c0-3feb-4dcd-b1ef-562821c0c0ed',  -- Employee Demo User ID  
    (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1),
    'Software Developer',
    '2023-06-10',
    65000.00,
    'Permanent',
    'active',
    4.2,
    NOW(),
    NOW()
)
ON CONFLICT (employee_code) DO NOTHING;

-- Step 3: Sample attendance records for the last 7 days
INSERT INTO public.attendance (
    id, employee_id, date, check_in_time, check_out_time,
    total_hours, overtime_hours, status, notes, created_at, updated_at
) VALUES
-- Admin attendance (excellent record)
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP001'), CURRENT_DATE - INTERVAL '1 day', '08:00:00', '18:00:00', 10.0, 2.0, 'present', 'Executive meeting', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP001'), CURRENT_DATE - INTERVAL '2 days', '07:45:00', '17:30:00', 9.75, 1.75, 'present', 'Strategy session', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP001'), CURRENT_DATE - INTERVAL '3 days', '08:15:00', '17:45:00', 9.5, 1.5, 'present', 'Board meeting', NOW(), NOW()),

-- Manager attendance (good record)  
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP002'), CURRENT_DATE - INTERVAL '1 day', '08:30:00', '17:30:00', 9.0, 1.0, 'present', 'Team meetings', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP002'), CURRENT_DATE - INTERVAL '2 days', '09:00:00', '17:00:00', 8.0, 0.0, 'present', 'Regular day', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP002'), CURRENT_DATE - INTERVAL '3 days', '08:45:00', '17:15:00', 8.5, 0.5, 'present', 'HR reviews', NOW(), NOW()),

-- Employee attendance (standard record)
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP003'), CURRENT_DATE - INTERVAL '1 day', '09:00:00', '17:00:00', 8.0, 0.0, 'present', 'Development work', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP003'), CURRENT_DATE - INTERVAL '2 days', '09:15:00', '17:15:00', 8.0, 0.0, 'present', 'Code review', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP003'), CURRENT_DATE - INTERVAL '3 days', NULL, NULL, 0.0, 0.0, 'absent', 'Sick leave', NOW(), NOW());

-- Step 4: Sample payroll records
INSERT INTO public.payroll (
    id, employee_id, pay_period_start, pay_period_end, basic_salary,
    overtime_pay, bonus, deductions, gross_pay, net_pay, 
    status, processed_date, created_at, updated_at
) VALUES
-- Admin payroll
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2024-11-01', '2024-11-30', 10000.00, 2000.00, 5000.00, 1500.00, 17000.00, 15500.00, 'processed', '2024-11-30', NOW(), NOW()),

-- Manager payroll  
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP002'), '2024-11-01', '2024-11-30', 7083.33, 500.00, 1000.00, 800.00, 8583.33, 7783.33, 'processed', '2024-11-30', NOW(), NOW()),

-- Employee payroll
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP003'), '2024-11-01', '2024-11-30', 5416.67, 0.00, 500.00, 600.00, 5916.67, 5316.67, 'processed', '2024-11-30', NOW(), NOW());

-- Step 5: Sample leave requests
INSERT INTO public.leaves (
    id, employee_id, leave_type, start_date, end_date, days_requested,
    reason, status, applied_date, approved_by, approved_date, created_at, updated_at
) VALUES
-- Admin leave requests
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Annual', '2024-12-20', '2024-12-27', 7, 'Christmas vacation with family', 'approved', '2024-11-01', (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2024-11-02', NOW(), NOW()),

-- Manager leave requests
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Annual', '2024-12-15', '2024-12-19', 5, 'Year-end holiday break', 'approved', '2024-10-15', (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2024-10-16', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Sick', '2024-11-10', '2024-11-12', 3, 'Medical appointment and recovery', 'approved', '2024-11-09', (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2024-11-09', NOW(), NOW()),

-- Employee leave requests
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Annual', '2024-12-02', '2024-12-06', 5, 'Personal vacation', 'pending', '2024-11-20', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Sick', '2024-11-05', '2024-11-05', 1, 'Flu symptoms', 'approved', '2024-11-04', (SELECT id FROM employees WHERE employee_code = 'EMP002'), '2024-11-05', NOW(), NOW());

-- Verification queries to check the data
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DEMO DATA POPULATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary of created data:';
    RAISE NOTICE '• Departments: % records', (SELECT COUNT(*) FROM public.departments);
    RAISE NOTICE '• Employees: % records', (SELECT COUNT(*) FROM public.employees WHERE employee_code LIKE 'EMP%');
    RAISE NOTICE '• Attendance: % records', (SELECT COUNT(*) FROM public.attendance);
    RAISE NOTICE '• Leave Requests: % records', (SELECT COUNT(*) FROM public.leaves);
    RAISE NOTICE '• Payroll Records: % records', (SELECT COUNT(*) FROM public.payroll);
    RAISE NOTICE '';
    RAISE NOTICE 'Demo users with employee records:';
    RAISE NOTICE '• Admin Demo User (CTO): EMP001';
    RAISE NOTICE '• Manager Demo User (HR Manager): EMP002'; 
    RAISE NOTICE '• Employee Demo User (Developer): EMP003';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Ready for comprehensive testing!';
    RAISE NOTICE 'You can now login and see realistic data for all demo users.';
    RAISE NOTICE '========================================';
END $$;