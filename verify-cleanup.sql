-- Verify cleanup of duplicate attendance records
-- Run this in Supabase SQL Editor

-- Check for any attendance records with date 2026-02-15
SELECT 
    id, 
    employee_id, 
    date, 
    clock_in, 
    clock_out, 
    status,
    created_at
FROM attendance
WHERE date = '2026-02-15'
ORDER BY created_at DESC;

-- If records still exist, delete them
-- DELETE FROM attendance WHERE date = '2026-02-15';
-- SELECT 'Deleted' as status, COUNT(*) as count FROM attendance WHERE date = '2026-02-15';
