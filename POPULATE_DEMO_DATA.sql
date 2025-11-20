-- ============================================================
-- WORKING DEMO DATA FOR EMS APPLICATION
-- Run this SQL in Supabase SQL Editor to populate realistic demo data
-- Updated: November 20, 2025 - Fixed UUID format issues
-- ============================================================

-- FIRST: Get the actual user IDs for our demo users
-- Replace these IDs with the actual IDs from your terminal output:
-- ADMIN: 'efef99b2-4e4b-478b-8450-4951303271a6' -- Admin Demo User (demo.admin@company.com)
-- MANAGER: '9a193729-489e-4ab9-99ea-72f4a672ce9c' -- Manager Demo User (demo.manager@company.com)  
-- EMPLOYEE: '9bc261c0-3feb-4dcd-b1ef-562821c0c0ed' -- Employee Demo User (demo.employee@company.com)

-- Step 1: Create departments
INSERT INTO public.departments (id, name, description, manager_id, created_at, updated_at) 
VALUES
(gen_random_uuid(), 'Engineering', 'Software Development and IT Operations', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Human Resources', 'Employee Relations and Talent Management', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Marketing', 'Digital Marketing and Brand Management', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Finance', 'Accounting and Financial Planning', NULL, NOW(), NOW()),
(gen_random_uuid(), 'Operations', 'Business Operations and Support', NULL, NOW(), NOW());
-- Demo Manager Employee Record  
(
    'emp-manager-001',
    'EMP002',
    '9a193729-489e-4ab9-99ea-72f4a672ce9c',  -- Manager Demo User ID
    'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',  -- HR Department
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
    'emp-employee-001', 
    'EMP003',
    '9bc261c0-3feb-4dcd-b1ef-562821c0c0ed',  -- Employee Demo User ID
    'd1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6',  -- Engineering Department
    'Software Developer',
    '2023-06-10', 
    75000.00,
    'Permanent',
    'active',
    4.2,
    NOW(),
    NOW()
),
-- Additional Demo Employees
(
    'emp-004',
    'EMP004',
    NULL,  -- We'll create a user for this later or use existing
    'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',  -- Marketing
    'Marketing Specialist', 
    '2023-08-15',
    65000.00,
    'Permanent',
    'active', 
    4.0,
    NOW(),
    NOW()
),
(
    'emp-005',
    'EMP005', 
    NULL,
    'c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8',  -- Finance
    'Financial Analyst',
    '2023-09-01',
    70000.00,
    'Permanent',
    'active',
    4.3,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create attendance records (last 30 days)
INSERT INTO public.attendance (id, employee_id, check_in, check_out, date, status, hours_worked, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    emp.id,
    -- Random check-in between 8:00-9:30 AM
    (date_series + interval '8 hours' + (random() * interval '1.5 hours'))::timestamp,
    -- Random check-out between 5:00-7:00 PM  
    (date_series + interval '17 hours' + (random() * interval '2 hours'))::timestamp,
    date_series::date,
    CASE 
        WHEN random() > 0.95 THEN 'absent'
        WHEN random() > 0.85 THEN 'late' 
        ELSE 'present'
    END,
    -- Calculate hours (typically 8-9 hours)
    8 + (random() * 2)::numeric(4,2),
    NOW(),
    NOW()
FROM generate_series(
    CURRENT_DATE - interval '30 days',
    CURRENT_DATE - interval '1 day', 
    interval '1 day'
) AS date_series
CROSS JOIN (
    SELECT id FROM public.employees 
    WHERE employee_code IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005')
) AS emp
-- Skip weekends
WHERE EXTRACT(dow FROM date_series) NOT IN (0, 6);

-- Create leave requests with different statuses
INSERT INTO public.leaves (
    id, employee_id, leave_type, start_date, end_date, days_count, 
    reason, status, approved_by, approved_at, created_at, updated_at
) VALUES
-- Approved leave for Demo Employee
(
    gen_random_uuid(),
    'emp-employee-001',
    'Vacation',
    '2024-12-23',
    '2024-12-27',
    5,
    'Christmas holiday vacation with family',
    'Approved',
    'emp-manager-001',  -- Approved by HR Manager
    NOW() - interval '2 days',
    NOW() - interval '5 days',
    NOW()
),
-- Pending leave for Demo Employee  
(
    gen_random_uuid(),
    'emp-employee-001', 
    'Sick',
    '2024-12-02',
    '2024-12-03',
    2,
    'Medical appointment and recovery',
    'Pending',
    NULL,
    NULL,
    NOW() - interval '1 day',
    NOW()
),
-- Approved leave for Marketing employee
(
    gen_random_uuid(),
    'emp-004',
    'Personal',
    '2024-11-25',
    '2024-11-26',  
    2,
    'Personal matters - family event',
    'Approved',
    'emp-manager-001',
    NOW() - interval '7 days',
    NOW() - interval '10 days', 
    NOW()
),
-- Rejected leave example
(
    gen_random_uuid(),
    'emp-005',
    'Vacation', 
    '2024-12-15',
    '2024-12-22',
    6,
    'Extended holiday vacation',
    'Rejected', 
    'emp-admin-001',  -- Rejected by CTO
    NOW() - interval '3 days',
    NOW() - interval '8 days',
    NOW()
);

-- Create payroll records for the last 3 months
INSERT INTO public.payroll (
    id, employee_id, month, year, base_salary, bonus, deductions, 
    net_pay, payment_date, status, created_at, updated_at
) VALUES
-- November 2024 payroll
(
    gen_random_uuid(),
    'emp-admin-001',
    'November',
    2024,
    120000.00 / 12,  -- Monthly salary
    5000.00,         -- Performance bonus
    2500.00,         -- Taxes and deductions
    12500.00,        -- Net pay
    '2024-11-30',
    'Paid',
    '2024-11-25',
    '2024-11-30'
),
(
    gen_random_uuid(), 
    'emp-manager-001',
    'November',
    2024,
    85000.00 / 12,
    2000.00,
    1750.00,
    7333.33,
    '2024-11-30',
    'Paid',
    '2024-11-25', 
    '2024-11-30'
),
(
    gen_random_uuid(),
    'emp-employee-001', 
    'November',
    2024,
    75000.00 / 12,
    1500.00,
    1500.00,
    6250.00,
    '2024-11-30',
    'Paid',
    '2024-11-25',
    '2024-11-30'
),
-- October 2024 payroll
(
    gen_random_uuid(),
    'emp-admin-001',
    'October', 
    2024,
    120000.00 / 12,
    3000.00,
    2500.00,
    10500.00,
    '2024-10-31',
    'Paid',
    '2024-10-25',
    '2024-10-31'
),
(
    gen_random_uuid(),
    'emp-manager-001',
    'October',
    2024,
    85000.00 / 12,
    1000.00,
    1750.00,
    6333.33,
    '2024-10-31',
    'Paid', 
    '2024-10-25',
    '2024-10-31'
),
(
    gen_random_uuid(),
    'emp-employee-001',
    'October',
    2024,
    75000.00 / 12,
    800.00,
    1500.00,
    5550.00,
    '2024-10-31',
    'Paid',
    '2024-10-25',
    '2024-10-31'
);

-- Create notifications for different users
INSERT INTO public.notifications (
    id, user_id, title, message, type, is_read, created_at, updated_at
) VALUES
-- Admin notifications
(
    gen_random_uuid(),
    'efef99b2-4e4b-478b-8450-4951303271a6',  -- Admin Demo User
    'New Leave Request Pending',
    'Employee Demo User has submitted a sick leave request for review.',
    'leave_request',
    false,
    NOW() - interval '1 day',
    NOW()
),
(
    gen_random_uuid(),
    'efef99b2-4e4b-478b-8450-4951303271a6',
    'Monthly Payroll Completed', 
    'November 2024 payroll has been processed successfully for all employees.',
    'payroll',
    true,
    NOW() - interval '5 days',
    NOW() - interval '5 days'
),
-- Manager notifications
(
    gen_random_uuid(),
    '9a193729-489e-4ab9-99ea-72f4a672ce9c',  -- Manager Demo User
    'Leave Request Approved',
    'You approved vacation leave for Employee Demo User (Dec 23-27, 2024).',
    'leave_approval',
    true,
    NOW() - interval '2 days', 
    NOW() - interval '2 days'
),
-- Employee notifications  
(
    gen_random_uuid(),
    '9bc261c0-3feb-4dcd-b1ef-562821c0c0ed',  -- Employee Demo User
    'Leave Request Approved',
    'Your vacation leave request (Dec 23-27, 2024) has been approved by HR Manager.',
    'leave_approval',
    false,
    NOW() - interval '2 days',
    NOW()
),
(
    gen_random_uuid(), 
    '9bc261c0-3feb-4dcd-b1ef-562821c0c0ed',
    'Payslip Available',
    'Your November 2024 payslip is now available for download.',
    'payroll',
    true,
    NOW() - interval '6 days',
    NOW() - interval '5 days'
);

-- Update departments with manager assignments
UPDATE public.departments SET 
    manager_id = 'efef99b2-4e4b-478b-8450-4951303271a6',  -- Admin as Engineering Manager
    updated_at = NOW()
WHERE id = 'd1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6';

UPDATE public.departments SET
    manager_id = '9a193729-489e-4ab9-99ea-72f4a672ce9c',   -- Manager as HR Manager  
    updated_at = NOW()
WHERE id = 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6';

-- Create system settings for the application
INSERT INTO public.system_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES
('setting-001', 'company_name', 'TechCorp Solutions', 'Company name displayed in the application', NOW(), NOW()),
('setting-002', 'max_leave_days', '25', 'Maximum leave days per year for employees', NOW(), NOW()),
('setting-003', 'work_hours_per_day', '8', 'Standard work hours per day', NOW(), NOW()),
('setting-004', 'payroll_frequency', 'monthly', 'Payroll processing frequency', NOW(), NOW()),
('setting-005', 'currency', 'USD', 'Default currency for salary and payments', NOW(), NOW()),
('setting-006', 'timezone', 'America/New_York', 'Default timezone for the application', NOW(), NOW()),
('setting-007', 'demo_mode', 'true', 'Indicates if the application is in demo mode', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

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
    RAISE NOTICE '• Notifications: % records', (SELECT COUNT(*) FROM public.notifications);
    RAISE NOTICE '• System Settings: % records', (SELECT COUNT(*) FROM public.system_settings);
    RAISE NOTICE '';
    RAISE NOTICE 'Demo users with employee records:';
    RAISE NOTICE '• Admin Demo User (CTO): EMP001';
    RAISE NOTICE '• Manager Demo User (HR Manager): EMP002'; 
    RAISE NOTICE '• Employee Demo User (Developer): EMP003';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Ready for comprehensive testing!';
    RAISE NOTICE '========================================';
END $$;