-- ================================================
-- CLEANUP TEST DATA - RUN THIS FIRST
-- ================================================
-- This removes conflicting test records from previous test runs
-- Run this in Supabase SQL Editor BEFORE running tests

-- Clean future attendance records (test data)
DELETE FROM attendance 
WHERE employee_id = '14d73959-0a1d-4e8d-b9b6-97e1841c70a2' 
  AND date >= CURRENT_DATE + INTERVAL '30 days';

-- Clean future payroll records (test data)
DELETE FROM payroll 
WHERE employee_id = '14d73959-0a1d-4e8d-b9b6-97e1841c70a2' 
  AND (year > EXTRACT(YEAR FROM CURRENT_DATE) 
       OR (year = EXTRACT(YEAR FROM CURRENT_DATE) 
           AND month > EXTRACT(MONTH FROM CURRENT_DATE) + 3));

-- Verify cleanup
SELECT 
  'Remaining future attendance' AS table_name,
  COUNT(*) AS count 
FROM attendance 
WHERE employee_id = '14d73959-0a1d-4e8d-b9b6-97e1841c70a2' 
  AND date >= CURRENT_DATE + INTERVAL '30 days'
UNION ALL
SELECT 
  'Remaining future payroll' AS table_name,
  COUNT(*) AS count 
FROM payroll 
WHERE employee_id = '14d73959-0a1d-4e8d-b9b6-97e1841c70a2' 
  AND (year > EXTRACT(YEAR FROM CURRENT_DATE) 
       OR (year = EXTRACT(YEAR FROM CURRENT_DATE) 
           AND month > EXTRACT(MONTH FROM CURRENT_DATE) + 3));

-- Expected result: Both counts should be 0
