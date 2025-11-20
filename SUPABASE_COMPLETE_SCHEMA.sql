-- =====================================================
-- EMPLOYEE MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- This will create all tables, relationships, policies, and sample data
-- =====================================================

-- Clean up existing tables (if any)
DROP TABLE IF EXISTS public.payroll CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- =====================================================
-- 1. USERS TABLE (Authentication and Roles)
-- =====================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'manager')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    budget DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. EMPLOYEES TABLE
-- =====================================================
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    position TEXT NOT NULL,
    employment_type TEXT CHECK (employment_type IN ('Permanent', 'Contract', 'Part-Time', 'Remote', 'Intern')),
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    phone TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    performance_rating DECIMAL(3, 2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 4. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    status TEXT CHECK (status IN ('Present', 'On Time', 'Late', 'Absent', 'Half Day', 'Leave', 'Work From Home')),
    notes TEXT,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- =====================================================
-- 5. PAYROLL TABLE
-- =====================================================
CREATE TABLE public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    basic_salary DECIMAL(10, 2) NOT NULL,
    allowances DECIMAL(10, 2) DEFAULT 0,
    bonuses DECIMAL(10, 2) DEFAULT 0,
    deductions DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_date DATE,
    payment_status TEXT CHECK (payment_status IN ('Pending', 'Processed', 'Paid', 'Failed')),
    payment_method TEXT CHECK (payment_method IN ('Bank Transfer', 'Cash', 'Cheque')),
    notes TEXT,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);

-- =====================================================
-- 6. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_department_id ON public.employees(department_id);
CREATE INDEX idx_employees_employee_code ON public.employees(employee_code);
CREATE INDEX idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_payroll_employee_id ON public.payroll(employee_id);
CREATE INDEX idx_payroll_month_year ON public.payroll(month, year);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- DEPARTMENTS TABLE POLICIES
CREATE POLICY "Everyone can view departments" ON public.departments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
    FOR ALL USING (true) WITH CHECK (true);

-- EMPLOYEES TABLE POLICIES
CREATE POLICY "Employees can view their own record" ON public.employees
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all employees" ON public.employees
    FOR ALL USING (true) WITH CHECK (true);

-- ATTENDANCE TABLE POLICIES
CREATE POLICY "Employees can view their own attendance" ON public.attendance
    FOR SELECT USING (true);

CREATE POLICY "Employees can insert their own attendance" ON public.attendance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all attendance" ON public.attendance
    FOR ALL USING (true) WITH CHECK (true);

-- PAYROLL TABLE POLICIES
CREATE POLICY "Employees can view their own payroll" ON public.payroll
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all payroll" ON public.payroll
    FOR ALL USING (true) WITH CHECK (true);

-- NOTIFICATIONS TABLE POLICIES
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (true);

CREATE POLICY "Admins can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- SYSTEM SETTINGS POLICIES
CREATE POLICY "Everyone can view settings" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.system_settings
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SAMPLE DATA - USERS
-- =====================================================
INSERT INTO public.users (id, email, full_name, role, is_active) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'admin@company.com', 'Admin User', 'admin', true),
    ('a2222222-2222-2222-2222-222222222222', 'manager@company.com', 'Sarah Johnson', 'manager', true),
    ('e1111111-1111-1111-1111-111111111111', 'john.doe@company.com', 'John Doe', 'employee', true),
    ('e2222222-2222-2222-2222-222222222222', 'jane.smith@company.com', 'Jane Smith', 'employee', true),
    ('e3333333-3333-3333-3333-333333333333', 'bob.johnson@company.com', 'Bob Johnson', 'employee', true),
    ('e4444444-4444-4444-4444-444444444444', 'alice.williams@company.com', 'Alice Williams', 'employee', true),
    ('e5555555-5555-5555-5555-555555555555', 'charlie.brown@company.com', 'Charlie Brown', 'employee', true);

-- =====================================================
-- SAMPLE DATA - DEPARTMENTS
-- =====================================================
INSERT INTO public.departments (id, name, description, manager_id, budget) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'Engineering', 'Software Development and IT', 'a2222222-2222-2222-2222-222222222222', 500000.00),
    ('d2222222-2222-2222-2222-222222222222', 'Marketing', 'Marketing and Communications', 'a2222222-2222-2222-2222-222222222222', 250000.00),
    ('d3333333-3333-3333-3333-333333333333', 'Operations', 'Operations and Infrastructure', 'a2222222-2222-2222-2222-222222222222', 300000.00),
    ('d4444444-4444-4444-4444-444444444444', 'Human Resources', 'HR and People Operations', 'a2222222-2222-2222-2222-222222222222', 150000.00),
    ('d5555555-5555-5555-5555-555555555555', 'Finance', 'Finance and Accounting', 'a2222222-2222-2222-2222-222222222222', 200000.00);

-- =====================================================
-- SAMPLE DATA - EMPLOYEES
-- =====================================================
INSERT INTO public.employees (user_id, employee_code, department_id, position, employment_type, hire_date, salary, phone, performance_rating) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'EMP001', 'd1111111-1111-1111-1111-111111111111', 'Senior Developer', 'Permanent', '2020-01-15', 85000.00, '+1-555-0101', 4.5),
    ('e2222222-2222-2222-2222-222222222222', 'EMP002', 'd2222222-2222-2222-2222-222222222222', 'Marketing Manager', 'Remote', '2019-06-01', 75000.00, '+1-555-0102', 4.8),
    ('e3333333-3333-3333-3333-333333333333', 'EMP003', 'd3333333-3333-3333-3333-333333333333', 'DevOps Engineer', 'Permanent', '2021-03-10', 80000.00, '+1-555-0103', 4.2),
    ('e4444444-4444-4444-4444-444444444444', 'EMP004', 'd4444444-4444-4444-4444-444444444444', 'HR Specialist', 'Permanent', '2022-01-20', 65000.00, '+1-555-0104', 4.6),
    ('e5555555-5555-5555-5555-555555555555', 'EMP005', 'd5555555-5555-5555-5555-555555555555', 'Financial Analyst', 'Contract', '2023-02-15', 70000.00, '+1-555-0105', 4.3);

-- =====================================================
-- SAMPLE DATA - ATTENDANCE (Last 30 days)
-- =====================================================
INSERT INTO public.attendance (employee_id, date, clock_in, clock_out, status) 
SELECT 
    e.id,
    CURRENT_DATE - (n || ' days')::interval,
    (CURRENT_DATE - (n || ' days')::interval + interval '09:00')::timestamptz,
    (CURRENT_DATE - (n || ' days')::interval + interval '17:00')::timestamptz,
    CASE 
        WHEN random() < 0.8 THEN 'On Time'
        WHEN random() < 0.95 THEN 'Late'
        ELSE 'Absent'
    END
FROM public.employees e
CROSS JOIN generate_series(1, 30) n
WHERE (CURRENT_DATE - (n || ' days')::interval)::date NOT IN (
    SELECT CURRENT_DATE - (n || ' days')::interval
    FROM generate_series(0, 30) n
    WHERE EXTRACT(DOW FROM CURRENT_DATE - (n || ' days')::interval) IN (0, 6)
);

-- =====================================================
-- SAMPLE DATA - PAYROLL (Last 6 months)
-- =====================================================
INSERT INTO public.payroll (employee_id, month, year, basic_salary, allowances, bonuses, deductions, tax, net_salary, payment_status, payment_method)
SELECT 
    e.id,
    EXTRACT(MONTH FROM month_date)::integer,
    EXTRACT(YEAR FROM month_date)::integer,
    e.salary,
    e.salary * 0.10, -- 10% allowances
    CASE WHEN random() < 0.3 THEN e.salary * 0.05 ELSE 0 END, -- occasional bonus
    e.salary * 0.02, -- 2% deductions
    e.salary * 0.15, -- 15% tax
    e.salary + (e.salary * 0.10) + CASE WHEN random() < 0.3 THEN e.salary * 0.05 ELSE 0 END - (e.salary * 0.02) - (e.salary * 0.15),
    'Paid',
    'Bank Transfer'
FROM public.employees e
CROSS JOIN (
    SELECT CURRENT_DATE - (n || ' months')::interval AS month_date
    FROM generate_series(0, 5) n
) months;

-- =====================================================
-- SAMPLE DATA - NOTIFICATIONS
-- =====================================================
INSERT INTO public.notifications (user_id, title, message, type, is_read) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Welcome to EMS', 'Welcome to the Employee Management System!', 'info', true),
    ('e1111111-1111-1111-1111-111111111111', 'Payroll Processed', 'Your payroll for this month has been processed.', 'success', false),
    ('e2222222-2222-2222-2222-222222222222', 'Team Meeting', 'Team meeting scheduled for tomorrow at 10 AM.', 'announcement', false),
    ('e3333333-3333-3333-3333-333333333333', 'Leave Request Approved', 'Your leave request has been approved.', 'success', true),
    ('e4444444-4444-4444-4444-444444444444', 'Document Upload Required', 'Please upload your updated documents.', 'warning', false);

-- =====================================================
-- SAMPLE DATA - SYSTEM SETTINGS
-- =====================================================
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
    ('company_name', 'DooKa Technologies', 'Company name displayed in the system'),
    ('working_hours_start', '09:00', 'Standard working hours start time'),
    ('working_hours_end', '17:00', 'Standard working hours end time'),
    ('currency', 'USD', 'Default currency for payroll'),
    ('late_threshold_minutes', '15', 'Minutes after which employee is marked late'),
    ('max_leave_days', '20', 'Maximum leave days per year'),
    ('payroll_day', '25', 'Day of month for payroll processing');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Employee Dashboard View
CREATE OR REPLACE VIEW employee_dashboard AS
SELECT 
    e.id,
    u.full_name,
    u.email,
    e.employee_code,
    e.position,
    d.name as department_name,
    e.employment_type,
    e.performance_rating,
    (SELECT COUNT(*) FROM attendance WHERE employee_id = e.id AND status = 'On Time' AND date >= CURRENT_DATE - interval '30 days') as days_on_time,
    (SELECT COUNT(*) FROM attendance WHERE employee_id = e.id AND status = 'Late' AND date >= CURRENT_DATE - interval '30 days') as days_late,
    (SELECT COUNT(*) FROM attendance WHERE employee_id = e.id AND status = 'Absent' AND date >= CURRENT_DATE - interval '30 days') as days_absent
FROM employees e
JOIN users u ON e.user_id = u.id
LEFT JOIN departments d ON e.department_id = d.id;

-- Monthly Payroll Summary View
CREATE OR REPLACE VIEW monthly_payroll_summary AS
SELECT 
    month,
    year,
    COUNT(*) as total_employees,
    SUM(basic_salary) as total_basic,
    SUM(allowances) as total_allowances,
    SUM(bonuses) as total_bonuses,
    SUM(deductions) as total_deductions,
    SUM(tax) as total_tax,
    SUM(net_salary) as total_net
FROM payroll
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- =====================================================
-- VERIFICATION QUERIES (Run these to check your data)
-- =====================================================

-- Check all tables have data
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'departments', COUNT(*) FROM public.departments
UNION ALL
SELECT 'employees', COUNT(*) FROM public.employees
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'payroll', COUNT(*) FROM public.payroll
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'system_settings', COUNT(*) FROM public.system_settings;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: 7';
    RAISE NOTICE 'Sample users: Admin (admin@company.com) + 5 Employees';
    RAISE NOTICE 'Sample departments: 5';
    RAISE NOTICE 'Sample employees: 5';
    RAISE NOTICE 'Sample attendance records: ~100+';
    RAISE NOTICE 'Sample payroll records: 30+';
    RAISE NOTICE 'Sample notifications: 5';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now use the API endpoints!';
    RAISE NOTICE '========================================';
END $$;
