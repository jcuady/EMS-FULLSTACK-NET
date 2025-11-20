-- Delete existing test users so we can re-create with correct password hashes
DELETE FROM users WHERE email IN ('admin@test.com', 'manager@test.com', 'employee@test.com');
