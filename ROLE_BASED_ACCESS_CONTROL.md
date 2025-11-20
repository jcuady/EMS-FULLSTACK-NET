# Role-Based Access Control (RBAC) - EMS Application

## Overview
The Employee Management System implements a comprehensive role-based access control system with three distinct roles:
- **Admin** - Full system access
- **Manager** - Full system access (treated as admin)
- **Employee** - Limited access to personal data only

## Authentication Context
Located in: `frontend/contexts/AuthContext.tsx`

### Role Definitions
```typescript
export type UserRole = 'admin' | 'employee' | 'manager'

// Role checks
const isAdmin = user?.role === 'admin' || user?.role === 'manager'  // Admin OR Manager
const isEmployee = user?.role === 'employee'                        // Employee only
const isManager = user?.role === 'manager'                          // Manager only
```

## Landing Page Routing
**File**: `app/page.tsx`

### Logic:
- No user → Redirect to `/login`
- Admin/Manager → Redirect to `/dashboard` (admin dashboard)
- Employee → Redirect to `/employee/dashboard` (employee dashboard)

## Admin/Manager Pages (isAdmin = true)

### 1. Dashboard (`/dashboard`)
**File**: `app/dashboard/page.tsx`
- **Protection**: `isAdmin` check with redirect to `/employee/dashboard`
- **Features**:
  - Total employees count
  - Attendance rate (last 30 days)
  - Average performance rating
  - Payroll summary (current month)
  - Satisfaction chart
  - Attendance chart
  - Employee directory table

### 2. Employees Management (`/employees`)
**File**: `app/employees/page.tsx`
- **Protection**: `isAdmin` check with redirect
- **Features**:
  - View all employees
  - Add new employees
  - Edit employee details
  - Delete employees
  - Search and filter employees

### 3. Attendance Management (`/attendance`)
**File**: `app/attendance/page.tsx`
- **Protection**: `isAdmin` check with redirect
- **Features**:
  - View all attendance records
  - Add attendance records
  - Edit attendance status
  - Delete attendance records
  - Filter by date, employee, status

### 4. Payroll Management (`/payroll`)
**File**: `app/payroll/page.tsx`
- **Protection**: `isAdmin` check with redirect
- **Features**:
  - View all payroll records
  - Create payroll for employees
  - Edit payroll details
  - Delete payroll records
  - Filter by month, year, employee

### 5. Notifications (`/notifications`)
**File**: `app/notifications/page.tsx`
- **Protection**: None (available to all roles)
- **Features**:
  - View all notifications
  - Mark as read/unread
  - Filter by type

### 6. Settings (`/settings`)
**File**: `app/settings/page.tsx`
- **Protection**: None (available to all roles)
- **Features**:
  - System settings configuration
  - User preferences

## Employee Pages (isEmployee = true)

### 1. Employee Dashboard (`/employee/dashboard`)
**File**: `app/employee/dashboard/page.tsx`
- **Protection**: `isEmployee` check with redirect to `/dashboard`
- **Features**:
  - Personal welcome message
  - Days present this month (from real attendance data)
  - On-time arrival rate (percentage)
  - Performance score (from employee record)
  - Monthly salary (from payroll data)
- **Data Source**: Fetches from `employees`, `attendance`, and `payroll` tables

### 2. Employee Attendance (`/employee/attendance`)
**File**: `app/employee/attendance/page.tsx`
- **Protection**: `isEmployee` check with redirect to `/dashboard`
- **Features**:
  - Clock in/out functionality
  - View personal attendance history
  - Current status (Clocked In/Out)
  - Working hours calculation
- **Data Source**: `attendance` table filtered by employee ID

### 3. Employee Profile (`/employee/profile`)
**File**: `app/employee/profile/page.tsx`
- **Protection**: `isEmployee` check with redirect to `/dashboard`
- **Features**:
  - View personal information (name, email, phone, DOB, address)
  - View employment information (employee ID, position, department, hire date, status)
  - View performance rating
- **Data Source**: `employees` table with department join, filtered by user ID

### 4. Employee Payslip (`/employee/payslip`)
**File**: `app/employee/payslip/page.tsx`
- **Protection**: `isEmployee` check with redirect to `/dashboard`
- **Features**:
  - Current month salary summary
  - Gross salary, deductions, net salary breakdown
  - Detailed current month breakdown (basic salary, allowances, bonuses, tax, deductions)
  - Payslip history table with all past months
  - Year-to-date (YTD) summary
  - Download payslip buttons (UI only, not yet implemented)
- **Data Source**: `payroll` table filtered by employee ID, ordered by year/month descending

## Sidebar Navigation
**File**: `components/Sidebar.tsx`

### Admin/Manager Navigation:
```
- Dashboard (/dashboard)
- Employees (/employees)
- Attendance (/attendance)
- Payroll (/payroll)
- Notifications (/notifications)
- Settings (/settings)
```

### Employee Navigation:
```
- Dashboard (/employee/dashboard)
- My Attendance (/employee/attendance)
- My Profile (/employee/profile)
- My Payslip (/employee/payslip)
- Notifications (/notifications)
- Settings (/settings)
```

## Topbar Component
**File**: `components/Topbar.tsx`

### Features:
- Displays logged-in user's full name
- Displays user's role (Admin, Manager, or Employee)
- Shows user initials in avatar
- Search bar (UI only)
- Notifications bell icon (links to `/notifications`)
- Settings gear icon (links to `/settings`)
- Logout button (links to `/logout`)

## Data Access Patterns

### Admin/Manager Access:
- **Full Access** to all database tables
- Can view, create, update, delete any record
- No filtering by user ID

### Employee Access:
- **Restricted Access** to own records only
- All queries filtered by `user_id` or `employee_id`
- **Read-only** for most data (except clock in/out)
- Cannot view other employees' data

## Security Implementation

### Frontend Protection:
1. **useEffect Redirects**: Check role on page mount, redirect if unauthorized
2. **Early Returns**: Return `null` if role check fails before rendering
3. **Loading States**: Show loading spinner while checking authentication

### Database Security (Supabase):
- Client-side filtering by employee_id
- Row-level security policies recommended for production
- Separate admin and employee API keys recommended

## Test Users

### Admin:
- **Email**: admin@company.com
- **Role**: admin
- **Access**: Full system access

### Manager:
- **Email**: manager@company.com
- **Role**: manager
- **Access**: Full system access (treated as admin)

### Employees:
1. **John Smith** (john.smith@company.com) - role: employee
2. **Sarah Johnson** (sarah.johnson@company.com) - role: employee
3. **Michael Davis** (michael.davis@company.com) - role: employee
4. **Emily Wilson** (emily.wilson@company.com) - role: employee
5. **David Brown** (david.brown@company.com) - role: employee

## Key Updates (November 14, 2024)

### Fixed Issues:
1. ✅ **Employee Profile Error**: Added null check to `getInitials()` function
2. ✅ **Dashboard Access**: Converted admin dashboard to client component with role protection
3. ✅ **Landing Page**: Added role-based routing logic
4. ✅ **Real Data Integration**: 
   - Topbar shows real logged-in user
   - Employee dashboard fetches real stats from database
   - Employee profile fetches real employee data
   - Employee payslip fetches real payroll records

### Role Protection Status:
- ✅ All admin pages protected with `isAdmin` check
- ✅ All employee pages protected with `isEmployee` check
- ✅ Proper redirects in place for unauthorized access
- ✅ Loading states implemented
- ✅ Zero compilation errors (CSS linting warnings ignored)

## Recommended Future Enhancements

1. **Backend API (.NET 8)**:
   - Create controllers for employees, attendance, payroll
   - Implement JWT authentication
   - Add role-based authorization attributes

2. **Database Security**:
   - Implement Supabase Row-Level Security (RLS) policies
   - Use service role key on backend, anon key on frontend
   - Add database-level role checks

3. **Form Validation**:
   - Install Zod for schema validation
   - Add error boundaries
   - Implement toast notifications

4. **Additional Features**:
   - Email notifications for payroll
   - PDF generation for payslips
   - Employee performance reviews
   - Leave management system

## Testing Checklist

- [ ] Login as Admin → Verify dashboard shows all employees data
- [ ] Login as Manager → Verify same access as Admin
- [ ] Login as Employee → Verify redirected to /employee/dashboard
- [ ] Admin try to access /employee/attendance → Should work (no restriction)
- [ ] Employee try to access /dashboard → Should redirect to /employee/dashboard
- [ ] Employee try to access /employees → Should redirect to /employee/dashboard
- [ ] Verify employee dashboard shows correct stats for logged-in user
- [ ] Verify employee profile shows correct data for logged-in user
- [ ] Verify employee payslip shows only logged-in employee's payroll
- [ ] Verify clock in/out creates records in database
- [ ] Logout and verify redirects to /login
- [ ] Verify Topbar shows correct user name and role for all users
