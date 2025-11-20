# 🧪 Employee Management System - Master Test Checklist

Use this checklist to verify every aspect of the system.

## 🟢 Phase 1: Infrastructure & Setup
- [ ] **Backend API** is running on `http://localhost:5000`
- [ ] **Frontend UI** is running on `http://localhost:3000`
- [ ] **Database** (Supabase) is connected
- [ ] **Redis** (optional) is running or caching falls back to memory

## 🟡 Phase 2: Authentication & Roles
### Admin (`admin@test.com`)
- [ ] Can Login
- [ ] Can view Admin Dashboard
- [ ] Can view Audit Logs
- [ ] Can Manage All Employees

### HR Manager (`manager@test.com`)
- [ ] Can Login
- [ ] Can view HR Dashboard
- [ ] Can Process Payroll
- [ ] Can Approve/Reject Leave

### Employee (`employee@test.com`)
- [ ] Can Login
- [ ] Can view Personal Dashboard
- [ ] Can Clock In/Out
- [ ] Can Request Leave
- [ ] Can View Payslips

## 🟠 Phase 3: Feature Verification

### 1. 👥 Employee Management
- [ ] **Create:** Add a new employee with photo URL
- [ ] **Read:** View employee profile details
- [ ] **Update:** Edit employee salary or department
- [ ] **Delete:** Deactivate an employee (Soft delete)

### 2. ⏱️ Attendance Tracking
- [ ] **Clock In:** Records current time and location (mock)
- [ ] **Clock Out:** Calculates duration correctly
- [ ] **History:** Shows list of past attendance records
- [ ] **Validation:** Cannot clock in twice without clocking out

### 3. 🏖️ Leave Management
- [ ] **Request:** Employee can submit leave request (Annual, Sick, etc.)
- [ ] **Balance:** Leave balance deducts correctly upon approval
- [ ] **Approval:** Manager sees pending requests and can Approve/Reject
- [ ] **Status:** Employee sees status update (Pending -> Approved)

### 4. 💰 Payroll Processing
- [ ] **Generate:** HR can generate payroll for a specific month
- [ ] **Calculation:** Basic + Allowances - Deductions = Net Salary
- [ ] **Payslip:** Employee can view/download payslip
- [ ] **History:** Historical payroll records are preserved

### 5. 📊 Reports & Analytics
- [ ] **Dashboard:** Stats (Total Employees, On Leave, etc.) load correctly
- [ ] **Export:** Can download Employee List as Excel/CSV
- [ ] **PDF:** Can generate Payroll Report PDF

### 6. 🔔 Notifications & Audit
- [ ] **Alerts:** User receives notification when leave is approved
- [ ] **Logs:** Admin sees "User X logged in" or "User Y updated profile" in Audit Logs

## 🔴 Phase 4: Edge Cases
- [ ] **Invalid Login:** Wrong password shows correct error
- [ ] **Unauthorized Access:** Employee cannot access Admin routes
- [ ] **Network Failure:** Frontend handles API downtime gracefully
