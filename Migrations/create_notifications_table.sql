-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at_trigger
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();

-- Insert sample notifications (optional)
-- Uncomment and adjust user_id values to match your database
/*
INSERT INTO notifications (user_id, title, message, type, link) VALUES
('your-user-id-here', 'Welcome!', 'Welcome to the Employee Management System. Start by exploring the dashboard.', 'info', '/dashboard'),
('your-user-id-here', 'Profile Updated', 'Your profile has been successfully updated.', 'success', '/profile'),
('your-user-id-here', 'Clock In Required', 'Please remember to clock in when you arrive at work.', 'warning', '/working-tracker'),
('your-user-id-here', 'Payroll Available', 'Your payroll for this month is now available.', 'success', '/payroll');
*/
