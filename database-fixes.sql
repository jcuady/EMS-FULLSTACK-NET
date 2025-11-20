-- ============================================================
-- SQL Script to Fix Employee Management System Database
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the 'users' table in public schema (for AUTH-01)
-- This allows the API to access user data
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Copy existing auth.users data to public.users (if any)
-- This syncs data from Supabase Auth to our public table
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    COALESCE(raw_user_meta_data->>'role', 'employee') as role,
    created_at,
    updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow anonymous read access (for API)
CREATE POLICY "Allow anonymous read access" 
ON public.users FOR SELECT 
USING (true);

-- 5. Create policy to allow service role full access
CREATE POLICY "Allow service role full access" 
ON public.users FOR ALL 
USING (auth.role() = 'service_role');

-- ============================================================
-- VERIFICATION QUERIES (Run these to confirm everything works)
-- ============================================================

-- Check if users table exists and has data
SELECT 'users table' as table_name, COUNT(*) as row_count FROM public.users;

-- Check attendance table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'attendance'
ORDER BY ordinal_position;

-- Check payroll table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payroll'
ORDER BY ordinal_position;

-- Check for any unique constraints that might block inserts
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ') AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('attendance', 'payroll', 'employees')
    AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

-- ============================================================
-- OPTIONAL: If you want to test the new users table
-- ============================================================

-- Insert a test user (optional)
-- INSERT INTO public.users (email, full_name, role) 
-- VALUES ('test@example.com', 'Test User', 'employee');

-- Query to see all users
-- SELECT id, email, full_name, role, is_active, created_at FROM public.users;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- If all queries ran successfully, your database is ready!
-- The .NET API should now work with:
-- ✅ GET /api/auth/users (users table now exists)
-- ✅ POST /api/attendance/clock-in (using HTTP client)
-- ✅ POST /api/attendance (using HTTP client)
-- ✅ POST /api/payroll (using HTTP client)
-- ============================================================
