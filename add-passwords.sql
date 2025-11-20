-- ============================================================
-- ADD DEFAULT PASSWORDS TO EMS USERS
-- Run this in Supabase SQL Editor to enable login functionality
-- ============================================================

-- Update all users with default password "test123" (BCrypt hashed)
-- This will allow login testing for all existing users
UPDATE public.users 
SET password_hash = '$2a$11$rjGjwQLlj5G8jEQJhYvpEeBKR5/9.qoJ2FU7Z1u.5k3zO5CxYMV.S',
    updated_at = NOW()
WHERE password_hash IS NULL;

-- Verify the password update
SELECT 
    email, 
    full_name, 
    role,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Password Set' 
        ELSE 'No Password' 
    END as password_status,
    is_active,
    updated_at
FROM public.users
ORDER BY role DESC, email;

-- Display login instructions
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PASSWORD UPDATE COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Default password for all users: test123';
    RAISE NOTICE '';
    RAISE NOTICE 'Test logins available:';
    RAISE NOTICE '  Admin: admin@company.com / test123';
    RAISE NOTICE '  Manager: manager@company.com / test123';
    RAISE NOTICE '  Employee: john.doe@company.com / test123';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now test authentication!';
    RAISE NOTICE '========================================';
END $$;