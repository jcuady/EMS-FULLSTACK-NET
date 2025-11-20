# Employee Management System - Frontend Dashboard MVP

A modern, dark-mode Next.js 14 dashboard for employee management with TailwindCSS, ShadCN/UI, Lucide Icons, and Recharts.

## 🎨 Features

✅ **Modern Dark UI** - Beautiful zinc/slate dark theme
✅ **Responsive Layout** - Sidebar + Topbar structure
✅ **Dashboard KPIs** - 4 key metric cards
✅ **Interactive Charts** - Employee satisfaction (Area Chart) & Attendance (Donut Chart)  
✅ **Employee Directory** - Table with search, filter, and pagination
✅ **Mock Data** - No backend integration required
✅ **Fully Typed** - TypeScript throughout

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout with Sidebar + Topbar
│   ├── page.tsx                      # Root redirect to /dashboard
│   ├── globals.css                   # Dark mode CSS variables
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard page
│   ├── employees/
│   │   ├── page.tsx                  # Employees list (stub)
│   │   └── [id]/page.tsx             # Employee detail (stub)
│   └── attendance/
│       └── page.tsx                  # Attendance page (stub)
├── components/
│   ├── ui/                           # ShadCN UI components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── table.tsx
│   ├── Sidebar.tsx                   # Left navigation panel
│   ├── Topbar.tsx                    # Top header with search & profile
│   ├── CardKPI.tsx                   # Reusable KPI card
│   ├── SatisfactionChart.tsx         # Recharts Area Chart
│   ├── AttendanceChart.tsx           # Recharts Donut Chart
│   └── EmployeeTable.tsx             # Employee directory table
├── lib/
│   └── utils.ts                      # Utility functions (cn helper)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## 🚀 Installation & Setup

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

This will install:
- **Next.js 14** - React framework
- **TailwindCSS** - Utility-first CSS
- **ShadCN/UI** - Radix UI components
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **TypeScript** - Type safety

### 3. Run the development server

```bash
npm run dev
```

### 4. Open your browser

Navigate to: **http://localhost:3000**

The app will automatically redirect to `/dashboard`

---

## 📊 Dashboard Components

### KPI Cards
- **Total Employees**: 250 (+5% from last month)
- **Attendance Rate**: 92% (+2.1% from last week)
- **Performance Ratings**: 4.2 out of 5.0
- **Payroll Summary**: $125K monthly total

### Charts
- **Employee Satisfaction Chart** (2/3 width)
  - Area chart with purple/blue lines
  - Shows satisfaction vs engagement over 6 months
  - Smooth curves with gradient fills

- **Attendance Chart** (1/3 width)
  - Donut chart with centered text "40 / 100"
  - Color-coded segments: On Time (purple), Late (orange), Absent (red)
  - Legend below in 2-column grid

### Employee Directory
- Search bar + Filter button
- Table with 3 mock employees
- Columns: Name (with avatar), Department, Job Title, Status
- Color-coded status badges (Permanent = green, Remote = blue)
- Pagination controls (1, 2, 3, Next)

---

## 🎨 Design Specifications

### Color Palette
- **Background**: `zinc-950` (very dark gray)
- **Cards**: `zinc-900` (slightly lighter)
- **Primary Accent**: `blue-500` (bright blue)
- **Text**: White/light gray
- **Borders**: `zinc-800`

### Typography
- Font: **Inter** (Google Font)
- Clean, modern sans-serif

### Layout
- **Sidebar**: Fixed width (w-64), hidden on mobile
- **Topbar**: Sticky, full width
- **Main Content**: Padded container with responsive grid

---

## 🧩 Component Usage

### CardKPI
```tsx
<CardKPI
  title="Total Employees"
  value="250"
  description="+5% from last month"
  icon={Users}
/>
```

### SatisfactionChart
```tsx
<SatisfactionChart />
```
- Fully self-contained with mock data
- Uses Recharts `AreaChart` with two data series

### AttendanceChart
```tsx
<AttendanceChart />
```
- Donut chart with centered text
- Legend with color indicators

### EmployeeTable
```tsx
<EmployeeTable />
```
- Complete table with search, filter, pagination
- Mock employee data included

---

## 🔗 Navigation Links

### Top Group (Sidebar)
- ✅ **Dashboard** (`/dashboard`) - Active by default
- 📋 **Employee** (`/employees`) - With chevron submenu indicator
- 📅 **Attendance** (`/attendance`)
- 💰 **Payroll** (`/payroll`) - Stub
- ⏰ **Working Tracker** (`/working-tracker`) - Stub
- 🔔 **Notifications** (`/notifications`) - Stub

### Bottom Group (Sidebar)
- ⚙️ **Settings** (`/settings`) - Stub
- ❓ **Help & Support** (`/help`) - Stub
- 🚪 **Log Out** (`/logout`) - Stub

---

## 📝 Mock Data

### KPI Values
- Total Employees: 250
- Attendance Rate: 92%
- Performance Ratings: 4.2
- Payroll Summary: $125K

### Chart Data
**Satisfaction Chart** (6 months):
```js
[
  { month: "Jan", satisfaction: 78, engagement: 65 },
  { month: "Feb", satisfaction: 82, engagement: 70 },
  { month: "Mar", satisfaction: 75, engagement: 68 },
  { month: "Apr", satisfaction: 88, engagement: 75 },
  { month: "May", satisfaction: 85, engagement: 80 },
  { month: "Jun", satisfaction: 92, engagement: 85 },
]
```

**Attendance Chart**:
- On Time: 30
- Late: 6
- Absent: 4
- Total: 100
- Present: 40

### Employee Table (3 employees):
1. **John Doe** - Engineering, Senior Developer, Permanent
2. **Jane Smith** - Marketing, Marketing Manager, Remote
3. **Bob Johnson** - Operations, DevOps Engineer, Permanent

---

## 🛠️ Customization

### Change Colors
Edit `app/globals.css` CSS variables:
```css
.dark {
  --primary: 217 91% 60%;  /* Blue accent */
  --background: 240 6% 10%; /* Dark bg */
  --card: 240 4% 16%;       /* Card bg */
}
```

### Add New KPI
```tsx
<CardKPI
  title="Your Metric"
  value="100"
  description="Your description"
  icon={YourIcon}
/>
```

### Modify Chart Data
Update the `data` array in:
- `components/SatisfactionChart.tsx`
- `components/AttendanceChart.tsx`

### Add Employees
Update `mockEmployees` in `components/EmployeeTable.tsx`

---

## 📦 Build for Production

```bash
npm run build
npm start
```

Output will be optimized and ready for deployment.

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
- **Netlify**: Connect GitHub repo
- **AWS Amplify**: Import project
- **Docker**: Use included Dockerfile (if added)

---

## 🐛 Troubleshooting

### Port already in use
```bash
npm run dev -- -p 3001
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run build
```
Will show all type errors that need fixing

---

## 🔜 Next Steps

Once the MVP is complete, consider adding:

1. **Backend Integration**
   - Connect to .NET API
   - Real-time data fetching
   - API endpoints integration

2. **Authentication**
   - Login/logout functionality
   - Protected routes
   - User sessions

3. **State Management**
   - Zustand or Redux
   - Global state for user data

4. **Advanced Features**
   - Employee CRUD operations
   - File uploads (avatars, documents)
   - Notifications system
   - Dark/Light mode toggle

5. **Performance**
   - React Query for data fetching
   - Optimistic updates
   - Skeleton loaders

---

## 📚 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.15 | React framework |
| React | 18.3.1 | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.4.15 | Styling |
| ShadCN/UI | Latest | Component library |
| Lucide React | 0.460.0 | Icons |
| Recharts | 2.13.3 | Charts |
| Radix UI | Latest | Headless components |

---

## 📄 License

MIT License - Free to use and modify

---

## 🤝 Contributing

This is an MVP. Feel free to:
- Add new features
- Improve design
- Optimize performance
- Fix bugs

---

## 📞 Support

For questions or issues:
1. Check the documentation
2. Review component props
3. Inspect browser console
4. Check Next.js documentation

---

**Created:** November 14, 2025  
**Status:** MVP Complete ✅  
**Next Phase:** Backend Integration
