-- ============================================================
-- SUPABASE DATABASE STATUS CHECK
-- Copy these queries one by one into Supabase SQL Editor
-- ============================================================

-- Query 1: Check All Tables and Data Count
-- ============================================================
SELECT 
    schemaname,
    tablename,
    (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
    SELECT 
        schemaname, 
        tablename, 
        query_to_xml(format('select count(*) as cnt from %I.%I', schemaname, tablename), false, true, '') as xml_count
    FROM pg_tables 
    WHERE schemaname = 'public'
) t
ORDER BY tablename;

-- Query 2: Check Users Table Structure  
-- ============================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Query 3: Sample Data Count in Key Tables
-- ============================================================
SELECT 'users' as table_name, count(*) as count FROM public.users
UNION ALL
SELECT 'employees', count(*) FROM public.employees  
UNION ALL
SELECT 'departments', count(*) FROM public.departments
UNION ALL  
SELECT 'attendance', count(*) FROM public.attendance
UNION ALL
SELECT 'payroll', count(*) FROM public.payroll
UNION ALL
SELECT 'notifications', count(*) FROM public.notifications;

-- Query 4: Check RLS Policies
-- ============================================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Query 5: Check Recent Activity (if any data exists)
-- ============================================================
SELECT 'Recent Users' as info, count(*) as count, max(created_at) as latest
FROM public.users
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'Recent Employees', count(*), max(created_at)
FROM public.employees  
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'Recent Attendance', count(*), max(created_at)
FROM public.attendance
WHERE created_at > NOW() - INTERVAL '7 days';

-- Query 6: Check for Any Test Data
-- ============================================================
SELECT 'Test Users' as type, count(*) as count
FROM public.users 
WHERE email LIKE '%test%' OR email LIKE '%demo%'
UNION ALL
SELECT 'Test Employees', count(*)
FROM public.employees e
JOIN public.users u ON e.user_id = u.id
WHERE u.email LIKE '%test%' OR e.employee_code LIKE 'TEST%';