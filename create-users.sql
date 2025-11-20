-- Delete existing test users (clean slate)
DELETE FROM users WHERE email IN ('admin@test.com', 'manager@test.com', 'employee@test.com');

-- Insert admin user
-- Password: Admin@123
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@test.com',
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'admin',
    true,
    NOW(),
    NOW()
);

-- Insert manager user
-- Password: Manager@123
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'manager@test.com',
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'HR Manager',
    'manager',
    true,
    NOW(),
    NOW()
);

-- Insert employee user  
-- Password: Employee@123
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'employee@test.com',
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'John Employee',
    'employee',
    true,
    NOW(),
    NOW()
);

-- Verify
SELECT email, full_name, role, is_active FROM users WHERE email IN ('admin@test.com', 'manager@test.com', 'employee@test.com');
