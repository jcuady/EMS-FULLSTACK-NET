-- =====================================================
-- Audit Logs Table Migration
-- Description: Create audit_logs table for tracking user actions
-- Created: 2024
-- =====================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_action CHECK (
        action IN (
            'Created', 'Updated', 'Deleted', 'Viewed', 
            'Approved', 'Rejected', 'Login', 'Logout',
            'Export', 'Import', 'Downloaded', 'Uploaded'
        )
    ),
    CONSTRAINT valid_entity_type CHECK (
        entity_type IN (
            'Employee', 'Attendance', 'Payroll', 'Leave', 
            'User', 'Notification', 'Report', 'System'
        )
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_role ON audit_logs(user_role);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_entity ON audit_logs(user_id, entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_action ON audit_logs(entity_type, action, created_at DESC);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail of all user actions in the system';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (Created, Updated, etc.)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (Employee, Payroll, etc.)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the specific entity affected';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object containing before/after values for updates';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser/client user agent string';
