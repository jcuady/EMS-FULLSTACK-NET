# 🧪 Testing Guide - Employee Management System

## Quick Start

### 1. Start Both Servers

**Backend (.NET)**:
```powershell
cd C:\Users\joaxp\OneDrive\Documents\EMS
dotnet run --project EmployeeMvp.csproj
```
✅ Backend runs on: `http://localhost:5000`

**Frontend (Next.js)**:
```powershell
cd C:\Users\joaxp\OneDrive\Documents\EMS\frontend
npm run dev
```
✅ Frontend runs on: `http://localhost:3000`

---

## 📋 Feature Testing Checklist

### ✅ 1. Authentication
- Open browser: http://localhost:3000/login
- Login with: `admin@test.com` / `Admin@123`
- Should redirect to dashboard

### ✅ 2. Employee Management  
- Navigate to **Employees** page
- View employee list (table with pagination)
- Search for employees
- Add new employee (click "Add Employee")
- Edit employee details
- Delete employee

### ✅ 3. Attendance Tracking
- Navigate to **Attendance** page
- View all attendance records
- Filter by date range
- Navigate to **Working Tracker**
- Clock In (with optional notes)
- Clock Out (with optional notes)
- View live work duration

### ✅ 4. Payroll Management
- Navigate to **Payroll** page
- View payroll records
- Filter by employee or date
- Create new payroll record (Admin only)
- View payroll details

### ✅ 5. Leave Management (NEW)
- Navigate to **Leaves** page
- View all leave requests
- Navigate to **Request Leave**
  - Select leave type (Annual, Sick, Personal, etc.)
  - Choose start and end dates
  - Add reason
  - Submit request
  - View leave balance
- Navigate to **Pending Approvals** (Admin/Manager)
  - View pending requests
  - Approve or reject leaves
  - Add comments

### ✅ 6. Reports & Analytics (NEW)
- Navigate to **Reports** page
- Test Employee Report:
  - Select "Employee Report"
  - Choose PDF or Excel format
  - Click "Generate Report"
  - File should download
- Test Attendance Report:
  - Select "Attendance Report"
  - Set date range
  - Choose Excel format
  - Generate and download
- Test Payroll Report:
  - Select "Payroll Report"
  - Set date range
  - Generate PDF
- Test Leave Report:
  - Select "Leave Report"
  - Filter by status
  - Generate Excel

### ✅ 7. Notifications
- Navigate to **Notifications** page
- View all notifications
- Filter unread/read
- Mark as read
- Mark all as read
- Delete notifications

### ✅ 8. Audit Logging (NEW)
- Navigate to **Audit Logs** (Admin only)
- View audit trail of all system actions
- Filter by:
  - Entity Type (Employee, Leave, Payroll, etc.)
  - Action (Create, Update, Delete, Approve)
  - Date Range
- View change details (JSON before/after)
- Pagination (20 records per page)

### ✅ 9. Dashboard
- Navigate to **Dashboard**
- View statistics cards:
  - Total Employees
  - Today's Attendance
  - Pending Leaves
  - Recent Payroll
- Check charts and graphs
- View recent activity

---

## 🔧 API Testing (Using Browser or Postman)

### Get Auth Token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

Copy the `token` from response and use it in headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Test Endpoints

#### Employees
```http
GET http://localhost:5000/api/employees
Authorization: Bearer YOUR_TOKEN
```

#### Attendance
```http
GET http://localhost:5000/api/attendance
Authorization: Bearer YOUR_TOKEN
```

#### Leaves
```http
GET http://localhost:5000/api/leaves
Authorization: Bearer YOUR_TOKEN
```

```http
GET http://localhost:5000/api/leaves/pending
Authorization: Bearer YOUR_TOKEN
```

#### Reports
```http
POST http://localhost:5000/api/reports/employees
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "format": "pdf",
  "includeInactive": false
}
```

#### Audit Logs
```http
GET http://localhost:5000/api/audit?page=1&pageSize=20
Authorization: Bearer YOUR_TOKEN
```

```http
GET http://localhost:5000/api/audit?entityType=Leave&action=Create
Authorization: Bearer YOUR_TOKEN
```

---

## 🎯 Key Features to Verify

### Leave Management System
- [x] Request leave with balance validation
- [x] Approval workflow (Admin/Manager)
- [x] Automatic balance deduction
- [x] Leave history tracking
- [x] Multiple leave types supported

### Reporting & Analytics
- [x] PDF generation (QuestPDF)
- [x] Excel generation (ClosedXML)
- [x] 4 report types (Employee, Attendance, Payroll, Leave)
- [x] Date range filtering
- [x] Professional formatting

### Audit Logging
- [x] Tracks all CRUD operations
- [x] Records user, action, entity
- [x] Stores before/after changes (JSON)
- [x] IP address and user agent tracking
- [x] Admin-only access
- [x] Searchable and filterable

---

## 🐛 Troubleshooting

### Backend not starting?
1. Check if ports 5000/5001 are available
2. Verify Supabase credentials in `.env`
3. Check migrations are run in Supabase

### Frontend not loading?
1. Check if port 3000 is available
2. Run `npm install` if dependencies missing
3. Verify `.env.local` has correct API URL

### Login fails?
1. Check if users table has admin account
2. Verify password hash matches
3. Check JWT_SECRET in backend `.env`

### API returns 401 Unauthorized?
1. Check if token is valid (not expired)
2. Verify Authorization header format
3. Check user role matches endpoint requirements

---

## ✅ Test Results Expected

After complete testing, you should verify:

1. **Authentication**: Login/logout works, protected routes secured
2. **Employees**: CRUD operations complete, search functional
3. **Attendance**: Clock in/out works, records display correctly
4. **Payroll**: Records viewable, calculations accurate
5. **Leaves**: Requests created, approvals work, balances update
6. **Reports**: All 4 report types generate and download
7. **Notifications**: Create, read, delete operations work
8. **Audit**: All system actions logged, filters functional
9. **Dashboard**: Stats accurate, charts display

---

## 📊 Performance Metrics

Expected response times (with local database):
- Health Check: < 50ms
- Login: < 200ms
- Get Employees: < 500ms
- Clock In/Out: < 300ms
- Generate Report (PDF): < 2s
- Generate Report (Excel): < 3s
- Audit Logs (paginated): < 400ms

---

## 🎉 Success Criteria

✅ All 9 feature suites tested
✅ No console errors in browser DevTools
✅ All API endpoints return correct data
✅ Reports generate and download successfully
✅ Audit logs capture system actions
✅ UI is responsive and user-friendly
✅ Role-based access control working
✅ Data persists across page reloads

---

**Built with:**
- .NET 8 + PostgreSQL/Supabase
- Next.js 14 + TypeScript + TailwindCSS
- QuestPDF + ClosedXML
- JWT Authentication + Redis Caching
