# 🎯 Quick Start - Testing Authentication

## 🚀 Getting Started

### 1. Start the Application
```bash
# Frontend should already be running on http://localhost:3001
# If not, run:
cd frontend
npm run dev
```

### 2. Access the Login Page
Open your browser and go to: **http://localhost:3001/login**

---

## 👥 Test Users

### Admin Access
```
Name: John Doe
Email: admin@company.com
Role: Admin
Access: Full admin dashboard + all features
```

### Manager Access
```
Name: Jane Smith
Email: manager@company.com
Role: Manager
Access: Full admin dashboard + all features
```

### Employee Access (Choose any)
```
1. Alice Johnson - alice.johnson@example.com
2. Bob Williams - bob.williams@example.com
3. Charlie Brown - charlie.brown@example.com
4. Diana Prince - diana.prince@example.com
5. Eve Anderson - eve.anderson@example.com
```

---

## ✅ Quick Test Checklist

### Test 1: Admin Login (2 minutes)
- [ ] Go to http://localhost:3001/login
- [ ] Select "John Doe (admin@company.com)"
- [ ] Click "Sign In"
- [ ] Verify you're redirected to `/dashboard`
- [ ] Check sidebar shows: Dashboard, Employees, Attendance, Payroll, Working Tracker
- [ ] Verify user card at top shows "John Doe" and "Admin"

### Test 2: Employee Login (2 minutes)
- [ ] Navigate to `/logout` or manually go to `/login`
- [ ] Select "Alice Johnson"
- [ ] Click "Sign In"
- [ ] Verify you're redirected to `/employee/dashboard`
- [ ] Check sidebar shows: My Dashboard, My Profile, My Attendance, My Payslips
- [ ] Verify user card shows "Alice Johnson" and "Employee"

### Test 3: Logout (1 minute)
- [ ] Click "Log Out" in sidebar
- [ ] See personalized message with your name
- [ ] Click "Yes, Logout"
- [ ] Verify you're redirected to `/login`
- [ ] Try accessing `/dashboard` - should redirect to login

### Test 4: Session Persistence (30 seconds)
- [ ] Log in as any user
- [ ] Refresh the page (F5)
- [ ] Verify you're still logged in
- [ ] Verify correct menu still shows

---

## 🎨 Visual Reference

### Login Page
```
┌─────────────────────────────────────────┐
│  Employee Management System             │
│  Select a user to sign in (MVP Demo)   │
│                                         │
│  [Select User ▼]                        │
│  Choose a user...                       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Name:  John Doe                   │ │
│  │ Email: admin@company.com          │ │
│  │ Role:  Admin                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [🔓 Sign In]                          │
└─────────────────────────────────────────┘
```

### Sidebar (Admin)
```
┌────────────────────┐
│ ⬛ DooKa          │
│                    │
│ ┌────────────────┐ │
│ │ 👤 John Doe    │ │
│ │ Admin          │ │
│ └────────────────┘ │
│                    │
│ ▶ Dashboard        │
│   Employees        │
│   Attendance       │
│   Payroll          │
│   Working Tracker  │
│   Notifications    │
│                    │
│ ···                │
│                    │
│   Settings         │
│   Help & Support   │
│   Log Out          │
└────────────────────┘
```

### Sidebar (Employee)
```
┌────────────────────┐
│ ⬛ DooKa          │
│                    │
│ ┌────────────────┐ │
│ │ 👤 Alice       │ │
│ │ Employee       │ │
│ └────────────────┘ │
│                    │
│ ▶ My Dashboard     │
│   My Profile       │
│   My Attendance    │
│   My Payslips      │
│   Notifications    │
│                    │
│ ···                │
│                    │
│   Settings         │
│   Help & Support   │
│   Log Out          │
└────────────────────┘
```

---

## 🔍 Browser DevTools Check

### Check LocalStorage
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage**
4. Click on `http://localhost:3001`
5. Look for key: `ems_user`
6. Value should show:
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "full_name": "User Name",
  "role": "admin"
}
```

---

## 🎯 What to Expect

### ✅ Working Features
- Login with any of the 7 database users
- Automatic redirect based on role
- Different menu for admin vs employee
- User info displayed in sidebar
- Session persists on refresh
- Logout clears session
- Auto-redirect to login when not authenticated

### 🚧 Coming Next
- Employee CRUD page (admin only)
- Attendance CRUD page (admin only)
- Payroll CRUD page (admin only)
- Clock in/out for employees
- Backend API integration
- Form validation

---

## 📞 Need Help?

**Common Issues:**

1. **Can't see login page?**
   - Make sure frontend is running: `npm run dev`
   - Check URL: http://localhost:3001/login (note: 3001, not 3000)

2. **Dropdown is empty?**
   - Check Supabase connection in `.env.local`
   - Verify database has users in `users` table

3. **Redirects not working?**
   - Clear browser cache and localStorage
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Menu doesn't change?**
   - Log out completely
   - Clear localStorage
   - Log back in

---

**🎉 Enjoy testing the authentication system!**
