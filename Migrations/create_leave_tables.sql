-- Create leaves table
CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Sick', 'Vacation', 'Personal', 'Unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT positive_days CHECK (days_count > 0)
);

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    sick_leave_total INTEGER DEFAULT 10,
    sick_leave_used INTEGER DEFAULT 0,
    sick_leave_remaining INTEGER DEFAULT 10,
    vacation_leave_total INTEGER DEFAULT 15,
    vacation_leave_used INTEGER DEFAULT 0,
    vacation_leave_remaining INTEGER DEFAULT 15,
    personal_leave_total INTEGER DEFAULT 5,
    personal_leave_used INTEGER DEFAULT 0,
    personal_leave_remaining INTEGER DEFAULT 5,
    unpaid_leave_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, year)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_leave_type ON leaves(leave_type);
CREATE INDEX IF NOT EXISTS idx_leaves_start_date ON leaves(start_date);
CREATE INDEX IF NOT EXISTS idx_leaves_approved_by ON leaves(approved_by);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);

-- Create trigger to update updated_at timestamp for leaves
CREATE OR REPLACE FUNCTION update_leaves_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leaves_updated_at_trigger
BEFORE UPDATE ON leaves
FOR EACH ROW
EXECUTE FUNCTION update_leaves_updated_at();

-- Create trigger to update updated_at timestamp for leave_balances
CREATE OR REPLACE FUNCTION update_leave_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leave_balances_updated_at_trigger
BEFORE UPDATE ON leave_balances
FOR EACH ROW
EXECUTE FUNCTION update_leave_balances_updated_at();

-- Create function to automatically calculate days_count
CREATE OR REPLACE FUNCTION calculate_leave_days()
RETURNS TRIGGER AS $$
BEGIN
    NEW.days_count = (NEW.end_date - NEW.start_date) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_leave_days_trigger
BEFORE INSERT OR UPDATE ON leaves
FOR EACH ROW
EXECUTE FUNCTION calculate_leave_days();

-- Create function to initialize leave balance for new employees
CREATE OR REPLACE FUNCTION initialize_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO leave_balances (
        employee_id,
        year,
        sick_leave_total,
        sick_leave_used,
        sick_leave_remaining,
        vacation_leave_total,
        vacation_leave_used,
        vacation_leave_remaining,
        personal_leave_total,
        personal_leave_used,
        personal_leave_remaining,
        unpaid_leave_used
    ) VALUES (
        NEW.id,
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        10, 0, 10,
        15, 0, 15,
        5, 0, 5,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_leave_balance_trigger
AFTER INSERT ON employees
FOR EACH ROW
EXECUTE FUNCTION initialize_leave_balance();

-- Insert sample leave balances for existing employees (run once)
-- Uncomment and adjust employee IDs as needed
/*
INSERT INTO leave_balances (employee_id, year, sick_leave_total, sick_leave_used, sick_leave_remaining,
                            vacation_leave_total, vacation_leave_used, vacation_leave_remaining,
                            personal_leave_total, personal_leave_used, personal_leave_remaining, unpaid_leave_used)
SELECT 
    id as employee_id,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as year,
    10 as sick_leave_total, 0 as sick_leave_used, 10 as sick_leave_remaining,
    15 as vacation_leave_total, 0 as vacation_leave_used, 15 as vacation_leave_remaining,
    5 as personal_leave_total, 0 as personal_leave_used, 5 as personal_leave_remaining,
    0 as unpaid_leave_used
FROM employees
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances 
    WHERE leave_balances.employee_id = employees.id 
    AND leave_balances.year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
);
*/

-- Insert sample leave requests (optional - for testing)
/*
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
VALUES 
    ('employee-id-1', 'Sick', '2025-01-15', '2025-01-17', 'Medical appointment and recovery', 'Approved'),
    ('employee-id-2', 'Vacation', '2025-02-10', '2025-02-20', 'Family vacation to Hawaii', 'Pending'),
    ('employee-id-3', 'Personal', '2025-03-05', '2025-03-05', 'Personal matters to attend', 'Approved');
*/
