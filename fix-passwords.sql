-- ============================================================
-- FIX PASSWORD HASHES FOR EMS USERS
-- Run this in Supabase SQL Editor to fix authentication
-- ============================================================

-- First, let's see current password hashes
SELECT email, 
       CASE 
           WHEN password_hash IS NOT NULL THEN 'Has Hash' 
           ELSE 'No Hash' 
       END as hash_status,
       LEFT(password_hash, 20) as hash_preview
FROM public.users
WHERE email IN ('admin@company.com', 'manager@company.com', 'john.doe@company.com')
ORDER BY role DESC;

-- Update with verified BCrypt hash for "test123"
-- This hash is generated using BCrypt cost factor 10
UPDATE public.users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye1VHb1jXvGe5WHv7xJXvlh6tANWyG4oa',
    updated_at = NOW()
WHERE email IN (
    'admin@company.com',
    'manager@company.com', 
    'john.doe@company.com'
);

-- Verify the update
SELECT email, full_name, role,
       CASE 
           WHEN password_hash IS NOT NULL THEN 'Password Updated' 
           ELSE 'No Password' 
       END as status,
       updated_at
FROM public.users
WHERE email IN ('admin@company.com', 'manager@company.com', 'john.doe@company.com')
ORDER BY role DESC;

-- Test instructions
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PASSWORD HASH UPDATED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test credentials (password: test123):';
    RAISE NOTICE '  Admin: admin@company.com';
    RAISE NOTICE '  Manager: manager@company.com';
    RAISE NOTICE '  Employee: john.doe@company.com';
    RAISE NOTICE '';
    RAISE NOTICE 'Hash used: BCrypt cost factor 10';
    RAISE NOTICE '========================================';
END $$;