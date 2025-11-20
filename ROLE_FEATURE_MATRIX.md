# EMS Role & Feature Matrix

## 📊 Complete Feature Overview

### System Status
- **Frontend:** ✅ Running on localhost:3001
- **Backend:** .NET 8 API (localhost:5000 when running)
- **Database:** ✅ Supabase with 169 records
- **Compilation Errors:** 0 (only CSS linter warnings)

---

## 👥 User Roles

### 1. Admin (John Doe - admin@company.com)
**Full system access with all management capabilities**

#### Accessible Pages:
- ✅ Dashboard (`/dashboard`)
- ✅ Employee Management (`/employees`)
- ✅ Attendance Management (`/attendance`)
- ✅ Payroll Management (`/payroll`)
- ✅ Working Tracker (`/working-tracker`)
- ✅ Notifications (`/notifications`)
- ✅ Settings (`/settings`)
- ✅ Help & Support (`/help`)
- ✅ Logout (`/logout`)

#### Features:
- ✅ **Employee CRUD**: Create, read, update, delete employees
- ✅ **Attendance CRUD**: Create, read, update, delete attendance records
- ✅ **Payroll CRUD**: Create, read, update, delete payroll records
- ✅ **Dashboard Analytics**: View all KPIs, charts, and reports
- ✅ **Search & Filter**: All CRUD pages have advanced search and filtering
- ✅ **Statistics**: View real-time stats on all management pages
- ✅ **Notifications Management**: CRUD operations
- ✅ **Settings Management**: CRUD operations

#### Restrictions:
- ❌ Cannot access employee-specific pages (`/employee/*`)

---

### 2. Manager (Jane Smith - manager@company.com)
**Same access as Admin (manager = admin in this MVP)**

#### Accessible Pages:
- ✅ Dashboard (`/dashboard`)
- ✅ Employee Management (`/employees`)
- ✅ Attendance Management (`/attendance`)
- ✅ Payroll Management (`/payroll`)
- ✅ Working Tracker (`/working-tracker`)
- ✅ Notifications (`/notifications`)
- ✅ Settings (`/settings`)
- ✅ Help & Support (`/help`)
- ✅ Logout (`/logout`)

#### Features:
- ✅ All admin features (see above)

#### Restrictions:
- ❌ Cannot access employee-specific pages (`/employee/*`)

---

### 3. Employee (Alice Johnson, Bob Wilson, etc.)
**Limited access for personal data management**

#### Accessible Pages:
- ✅ My Dashboard (`/employee/dashboard`)
- ✅ My Profile (`/employee/profile`)
- ✅ My Attendance (`/employee/attendance`)
- ✅ My Payslips (`/employee/payslip`)
- ✅ Notifications (`/notifications`)
- ✅ Help & Support (`/help`)
- ✅ Logout (`/logout`)

#### Features:
- ✅ **Clock In/Out**: Record daily attendance with timestamp
- ✅ **Attendance History**: View last 10 attendance records
- ✅ **Monthly Stats**: View present days, absent days, late arrivals, attendance rate (last 30 days)
- ✅ **Today's Status**: View check in time, check out time, working hours, status
- ✅ **On-time Detection**: System marks as "on-time" if clocked in before 9:00 AM
- ✅ **Working Hours Calculation**: Real-time calculation of working hours
- ✅ **Leave Balance**: View annual, sick, and personal leave balances
- ✅ **View Personal Payslips**: (Page created, needs implementation)
- ✅ **View Personal Profile**: (Page created, needs implementation)
- ✅ **View Notifications**: Shared with admin

#### Restrictions:
- ❌ Cannot access admin pages (`/dashboard`, `/employees`, `/attendance`, `/payroll`, `/settings`)
- ❌ Cannot create/update/delete other employees
- ❌ Cannot manage other users' attendance
- ❌ Cannot access payroll management
- ❌ Cannot access system settings

---

## 🔐 Authentication System

### Login Mechanism
- **Type:** User selection (no password required for MVP)
- **Users:** 7 users loaded from Supabase database
- **Method:** Dropdown selection with email + role display
- **Storage:** localStorage persistence
- **Redirect:** Role-based (admin → `/dashboard`, employee → `/employee/dashboard`)

### Session Management
- **Persistence:** ✅ Sessions persist on page refresh
- **Logout:** ✅ Clears localStorage and redirects to `/login`
- **Protection:** ✅ Middleware redirects unauthenticated users to `/login`

---

## 📄 Page-by-Page Breakdown

### Admin/Manager Pages

#### 1. Dashboard (`/dashboard`)
**Role:** Admin, Manager  
**Status:** ✅ Complete

**Features:**
- KPI Cards: Total Employees (5), Total Attendance (110), Total Payroll, Active Projects
- Attendance Overview Chart (line/bar chart)
- Department Distribution Chart (pie/donut chart)
- Recent Employees Table (last 5)
- Recent Attendance Table (last 5)
- All data from Supabase database

---

#### 2. Employee Management (`/employees`)
**Role:** Admin, Manager  
**Status:** ✅ Complete with CRUD

**Features:**
- **CREATE**: Add new employee with all fields (code, name, email, phone, position, department, DOB, address, salary, performance, status)
- **READ**: View all employees in paginated table
- **UPDATE**: Edit existing employee data
- **DELETE**: Remove employee with confirmation
- **SEARCH**: By name, code, or position
- **FILTER**: By department dropdown
- **STATS**: 
  - Total Employees: 5
  - Active Employees: Count of active status
  - Departments: 5
  - Avg Performance: Average performance score
- **STATUS BADGES**: Active (green), Inactive (gray)
- **MODAL FORMS**: Add and Edit modals with all fields

**Database Table:** `employees`  
**Fields:** id, user_id, employee_code, full_name, email, phone, position, department_id, date_of_birth, address, base_salary, performance_score, status, created_at, updated_at

---

#### 3. Attendance Management (`/attendance`)
**Role:** Admin, Manager  
**Status:** ✅ Complete with CRUD

**Features:**
- **CREATE**: Add attendance record (employee, date, check in, check out, status)
- **READ**: View all attendance records
- **UPDATE**: Edit existing attendance record
- **DELETE**: Remove attendance record with confirmation
- **SEARCH**: By employee name
- **FILTERS**:
  - Employee dropdown (select specific employee)
  - Status dropdown (on-time, late, absent)
  - Date range (start date, end date)
- **STATS**:
  - Total Records: 110
  - On-Time %: Percentage of on-time records
  - Late %: Percentage of late records
  - Absent %: Percentage of absent records
- **STATUS BADGES**: On-Time (green), Late (yellow), Absent (red)
- **MODAL FORMS**: Add and Edit modals

**Database Table:** `attendance`  
**Fields:** id, employee_id, date, check_in_time, check_out_time, status, notes, created_at, updated_at

---

#### 4. Payroll Management (`/payroll`)
**Role:** Admin, Manager  
**Status:** ✅ Complete with CRUD

**Features:**
- **CREATE**: Add payroll record (employee, month, year, base salary, bonus, deductions, status)
- **READ**: View all payroll records
- **UPDATE**: Edit existing payroll record
- **DELETE**: Remove payroll record with confirmation
- **AUTO-CALCULATION**: Net Pay = Base Salary + Bonus - Deductions (real-time)
- **AUTO-FILL**: Selecting employee auto-fills base salary from employees table
- **FILTERS**:
  - Employee dropdown
  - Month dropdown (1-12)
  - Year dropdown
- **STATS**:
  - Total Payroll: Sum of all net pay
  - Average Salary: Average base salary
  - Total Records: Count of payroll records
  - Paid %: Percentage with "paid" status
- **STATUS BADGES**: Paid (green), Pending (yellow), Processing (blue)
- **MODAL FORMS**: Add and Edit modals

**Database Table:** `payroll`  
**Fields:** id, employee_id, month, year, base_salary, bonus, deductions, net_pay, status, payment_date, created_at, updated_at

---

#### 5. Notifications (`/notifications`)
**Role:** Admin, Manager, Employee  
**Status:** ✅ Complete with CRUD

**Features:**
- **CREATE**: Add notification (title, message, type, user)
- **READ**: View all notifications
- **UPDATE**: Edit notification
- **DELETE**: Remove notification
- **FILTERS**: By type, status
- **MARK AS READ**: Update read status

**Database Table:** `notifications`

---

#### 6. Settings (`/settings`)
**Role:** Admin, Manager  
**Status:** ✅ Complete with CRUD

**Features:**
- **CREATE**: Add setting
- **READ**: View all settings grouped by category
- **UPDATE**: Edit setting value
- **DELETE**: Remove setting
- **CATEGORIES**: System, Email, Security, Backup

**Database Table:** `system_settings`

---

### Employee Pages

#### 7. My Dashboard (`/employee/dashboard`)
**Role:** Employee  
**Status:** ✅ Created (static content)

**Features:**
- Personal KPI cards
- Quick links to attendance and payslips
- Recent notifications

---

#### 8. My Profile (`/employee/profile`)
**Role:** Employee  
**Status:** ✅ Created (static content, needs implementation)

**Planned Features:**
- View personal information
- Update profile picture
- Change contact details
- View employment history

---

#### 9. My Attendance (`/employee/attendance`)
**Role:** Employee  
**Status:** ✅ Complete with Clock In/Out

**Features:**
- **CLOCK IN**: 
  - Creates new attendance record with current time
  - Calculates status (on-time if before 9:00 AM, late if after)
  - Shows confirmation alert with timestamp
  - Updates Today's Status card
  - Button disabled if already clocked in
- **CLOCK OUT**:
  - Updates existing record with check out time
  - Shows confirmation alert with timestamp
  - Updates Today's Status card
  - Button disabled if already clocked out
- **TODAY'S STATUS**:
  - Clock In time
  - Clock Out time
  - Working Hours (real-time calculation)
  - Status (on-time/late badge)
- **MONTHLY STATS** (Last 30 days):
  - Present Days: Count of on-time + late
  - Absent Days: Count of absent
  - Late Arrivals: Count of late
  - Attendance Rate: Percentage calculation
- **RECENT HISTORY**:
  - Last 10 attendance records
  - Date, check in, check out, working hours, status
  - Ordered by date (newest first)
- **LEAVE BALANCE**:
  - Annual Leave: 12 days (60% progress bar)
  - Sick Leave: 3 days (30% progress bar)
  - Personal Leave: 2 days (20% progress bar)

**Database Table:** `attendance`  
**Operations:** SELECT (read history/stats), INSERT (clock in), UPDATE (clock out)

---

#### 10. My Payslips (`/employee/payslip`)
**Role:** Employee  
**Status:** ✅ Created (static content, needs implementation)

**Planned Features:**
- View personal payroll history
- Download payslip PDFs
- View salary breakdown

---

## 🔒 Access Control Matrix

| Page | Admin | Manager | Employee | Public |
|------|-------|---------|----------|--------|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ✅ | ✅ | ❌ | ❌ |
| `/employees` | ✅ | ✅ | ❌ | ❌ |
| `/attendance` | ✅ | ✅ | ❌ | ❌ |
| `/payroll` | ✅ | ✅ | ❌ | ❌ |
| `/notifications` | ✅ | ✅ | ✅ | ❌ |
| `/settings` | ✅ | ✅ | ❌ | ❌ |
| `/employee/dashboard` | ❌ | ❌ | ✅ | ❌ |
| `/employee/profile` | ❌ | ❌ | ✅ | ❌ |
| `/employee/attendance` | ❌ | ❌ | ✅ | ❌ |
| `/employee/payslip` | ❌ | ❌ | ✅ | ❌ |
| `/logout` | ✅ | ✅ | ✅ | ❌ |

---

## 📊 Database Schema (Supabase)

### Tables Overview

#### 1. `users` (7 records)
**Purpose:** Authentication and user roles

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | varchar | Unique |
| full_name | varchar | Display name |
| role | varchar | admin/manager/employee |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

**Records:**
1. John Doe (admin)
2. Jane Smith (manager)
3. Alice Johnson (employee)
4. Bob Wilson (employee)
5. Charlie Brown (employee)
6. Diana Ross (employee)
7. Edward Norton (employee)

---

#### 2. `departments` (5 records)
**Purpose:** Organize employees by department

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | varchar | Department name |
| manager_id | uuid | FK to employees |
| created_at | timestamp | Auto |

**Records:**
1. Engineering
2. Human Resources
3. Finance
4. Marketing
5. Sales

---

#### 3. `employees` (5 records)
**Purpose:** Employee master data

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| employee_code | varchar | Unique code |
| full_name | varchar | Full name |
| email | varchar | Email |
| phone | varchar | Phone |
| position | varchar | Job title |
| department_id | uuid | FK to departments |
| date_of_birth | date | DOB |
| address | text | Address |
| base_salary | decimal | Base salary |
| performance_score | decimal | 0-100 |
| status | varchar | active/inactive |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

---

#### 4. `attendance` (110 records)
**Purpose:** Track daily attendance

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| employee_id | uuid | FK to employees |
| date | date | Attendance date |
| check_in_time | time | Check in |
| check_out_time | time | Check out (nullable) |
| status | varchar | on-time/late/absent |
| notes | text | Optional notes |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

**Status Logic:**
- `on-time`: Check in before 9:00 AM
- `late`: Check in after 9:00 AM
- `absent`: No check in record

---

#### 5. `payroll` (30 records)
**Purpose:** Salary and payment tracking

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| employee_id | uuid | FK to employees |
| month | int | 1-12 |
| year | int | YYYY |
| base_salary | decimal | Base pay |
| bonus | decimal | Additional bonus |
| deductions | decimal | Deductions |
| net_pay | decimal | Calculated |
| status | varchar | paid/pending/processing |
| payment_date | date | Payment date |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

**Calculation:**
```
net_pay = base_salary + bonus - deductions
```

---

#### 6. `notifications` (5 records)
**Purpose:** System notifications

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| title | varchar | Title |
| message | text | Message |
| type | varchar | info/warning/error |
| read | boolean | Read status |
| created_at | timestamp | Auto |

---

#### 7. `system_settings` (7 records)
**Purpose:** Application configuration

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| key | varchar | Setting key |
| value | text | Setting value |
| category | varchar | System/Email/Security/Backup |
| description | text | Description |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

---

## 🎯 Feature Completion Status

### ✅ Fully Complete (13 features)
1. Authentication System (login, logout, session persistence)
2. Role-based Access Control
3. Dynamic Sidebar Navigation
4. Admin Dashboard (real data integration)
5. Employee Management CRUD
6. Attendance Management CRUD
7. Payroll Management CRUD
8. Notifications CRUD
9. Settings CRUD
10. Employee Clock In/Out
11. Employee Attendance History
12. Employee Monthly Stats
13. Route Protection

### ⏳ Partially Complete (2 features)
1. Employee Dashboard (static content, needs real data)
2. Employee Profile (static content, needs implementation)

### ❌ Not Started (3 features)
1. Employee Payslips (page created, needs implementation)
2. Backend .NET API (controllers not created)
3. Data Validation (no Zod schemas yet)

---

## 🚀 Quick Reference

### Start Frontend:
```powershell
cd "c:\Users\joaxp\OneDrive\Documents\EMS\frontend"
npm run dev
```
**URL:** http://localhost:3001

### Test Admin:
- **Login:** admin@company.com (John Doe)
- **Pages:** Dashboard, Employees, Attendance, Payroll

### Test Employee:
- **Login:** alice.johnson@company.com (Alice Johnson)
- **Pages:** My Dashboard, My Attendance (clock in/out)

### Database:
- **Platform:** Supabase
- **Tables:** 7
- **Records:** 169
- **Access:** Direct via supabase-js client

---

**Last Updated:** 2025-01-14  
**Total Features:** 18  
**Completed:** 13 (72%)  
**Frontend Status:** ✅ Running  
**Compilation Errors:** 0
