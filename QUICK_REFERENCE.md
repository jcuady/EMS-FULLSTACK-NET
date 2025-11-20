# 🚀 Quick Reference - EMS Testing

## Servers Running
✅ **Backend**: http://localhost:5000  
✅ **Frontend**: http://localhost:3000

## Test Credentials
📧 Email: `admin@test.com`  
🔐 Password: `Admin@123`

## New Features to Test (This Session)

### 1️⃣ Leave Management
- 📍 http://localhost:3000/leaves
- 📍 http://localhost:3000/leaves/request  
- 📍 http://localhost:3000/leaves/pending

**Test Flow:**
1. Request a leave (select type, dates, reason)
2. View leave balance
3. As admin, approve/reject in pending queue
4. Verify balance deduction

### 2️⃣ Reports & Analytics
- 📍 http://localhost:3000/reports

**Test Flow:**
1. Select "Employee Report" → Generate PDF
2. Select "Attendance Report" → Generate Excel
3. Select "Payroll Report" → Generate PDF
4. Select "Leave Report" → Generate Excel
5. Verify files download correctly

### 3️⃣ Audit Logging
- 📍 http://localhost:3000/audit (Admin only)

**Test Flow:**
1. View audit logs table
2. Filter by Entity Type (Employee, Leave, etc.)
3. Filter by Action (Create, Update, Delete)
4. Filter by date range
5. Click to expand JSON changes
6. Verify pagination works

## Test Scripts Available

### API Tests (PowerShell)
```powershell
cd C:\Users\joaxp\OneDrive\Documents\EMS
.\test-all-features.ps1
```

### Frontend Tests (PowerShell)
```powershell
cd C:\Users\joaxp\OneDrive\Documents\EMS
.\test-frontend.ps1
```

## All Features (9 Total)

1. ✅ Authentication & Login
2. ✅ Employee Management
3. ✅ Attendance Tracking
4. ✅ Payroll Processing
5. ✅ Notifications
6. ✅ **Leave Management** (NEW)
7. ✅ **Reports & Analytics** (NEW)
8. ✅ **Audit Logging** (NEW)
9. ✅ Dashboard & Stats

## Key Pages to Test

```
http://localhost:3000/login            - Login page
http://localhost:3000/dashboard        - Admin dashboard
http://localhost:3000/employees        - Employee list
http://localhost:3000/attendance       - Attendance records
http://localhost:3000/working-tracker  - Clock in/out
http://localhost:3000/payroll          - Payroll records
http://localhost:3000/leaves           - Leave list (NEW)
http://localhost:3000/leaves/request   - Request leave (NEW)
http://localhost:3000/leaves/pending   - Approve leaves (NEW)
http://localhost:3000/reports          - Generate reports (NEW)
http://localhost:3000/notifications    - Notifications
http://localhost:3000/audit            - Audit logs (NEW)
http://localhost:3000/help             - Help & FAQ
```

## Expected Results

✅ All pages load without errors  
✅ Forms validate input correctly  
✅ Reports generate and download  
✅ Audit logs capture all actions  
✅ Leave workflow (request → approve → balance update)  
✅ Role-based access enforced  
✅ Data persists correctly

## Troubleshooting

**Backend not responding?**
- Check terminal where `dotnet run` is running
- Verify http://localhost:5000/api/ returns response

**Frontend not loading?**
- Check terminal where `npm run dev` is running  
- Clear browser cache and reload

**Login fails?**
- Verify database has users table with admin account
- Check console (F12) for errors

## Documentation

📖 **TESTING_GUIDE.md** - Complete testing procedures  
📖 **IMPLEMENTATION_SUMMARY.md** - Full implementation details  
📖 **SECURITY_IMPLEMENTATION.md** - Security features

## Quick Stats

- **9** Major Features
- **35+** REST API Endpoints
- **14+** Frontend Pages
- **11** Database Tables
- **18,000+** Lines of Code
- **3** New Features (this session)

---

🎉 **Ready to test!** Open http://localhost:3000 and start exploring!
