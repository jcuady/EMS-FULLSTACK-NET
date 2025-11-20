# 🚀 Quick Start Guide - Employee Management Dashboard

## ⚡ Get Started in 3 Steps

### 1️⃣ Install Dependencies
```powershell
cd frontend
npm install
```

### 2️⃣ Run Development Server
```powershell
npm run dev
```

### 3️⃣ Open Browser
Navigate to: **http://localhost:3000**

---

## ✅ What You'll See

✨ **Dashboard Page** with:
- 4 KPI cards (Total Employees, Attendance Rate, Performance, Payroll)
- Employee Satisfaction area chart (purple & blue lines)
- Attendance donut chart with centered "40/100" text
- Employee directory table with 3 mock employees

🎨 **Dark Mode UI** with:
- Zinc-950 background
- Zinc-900 cards
- Blue primary accent
- Modern Inter font

📱 **Responsive Design**:
- Desktop: Sidebar + Topbar layout
- Mobile: Hidden sidebar (future: hamburger menu)

---

## 🧭 Navigation

Click these links in the sidebar:
- **Dashboard** ✅ (Active - full functionality)
- **Employee** 📋 (Stub - "Coming Soon")
- **Attendance** 📅 (Stub - "Coming Soon")

---

## 📊 Mock Data

All data is hardcoded for MVP demonstration:
- **No backend required**
- **No API calls**
- **Pure frontend**

---

## 🛠️ Available Scripts

```powershell
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

---

## 🐛 Common Issues

### Port 3000 already in use?
```powershell
npm run dev -- -p 3001
```

### Dependencies not installing?
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📝 Next Steps After MVP

1. ✅ **Backend Integration**
   - Connect to .NET API
   - Replace mock data with real data

2. ✅ **CRUD Operations**
   - Add/Edit/Delete employees
   - Real-time updates

3. ✅ **Authentication**
   - Login/Logout
   - Protected routes

---

**Need Help?** Check the full README.md for detailed documentation.
