import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdsjukksghhmacaftszv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkc2p1a2tzZ2hobWFjYWZ0c3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjI2OTUsImV4cCI6MjA3ODYzODY5NX0.BLI7GUJcb6rGkxokHXyzAwxXxjDbIcSfasQhuLzGooQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type User = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'employee' | 'manager'
  avatar_url?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export type Department = {
  id: string
  name: string
  description?: string
  manager_id?: string
  budget?: number
  created_at: string
  updated_at: string
}

export type Employee = {
  id: string
  user_id: string
  employee_code: string
  department_id?: string
  position: string
  employment_type: 'Permanent' | 'Contract' | 'Part-Time' | 'Remote' | 'Intern'
  hire_date: string
  salary?: number
  phone?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  date_of_birth?: string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  performance_rating?: number
  created_at: string
  updated_at: string
}

export type Attendance = {
  id: string
  employee_id: string
  date: string
  clock_in?: string
  clock_out?: string
  status: 'Present' | 'On Time' | 'Late' | 'Absent' | 'Half Day' | 'Leave' | 'Work From Home'
  notes?: string
  approved_by?: string
  created_at: string
  updated_at: string
}

export type Payroll = {
  id: string
  employee_id: string
  month: number
  year: number
  basic_salary: number
  allowances: number
  bonuses: number
  deductions: number
  tax: number
  net_salary: number
  payment_date?: string
  payment_status: 'Pending' | 'Processed' | 'Paid' | 'Failed'
  payment_method?: 'Bank Transfer' | 'Cash' | 'Cheque'
  notes?: string
  processed_by?: string
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement'
  is_read: boolean
  action_url?: string
  created_at: string
}
