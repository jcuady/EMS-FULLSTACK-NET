# 🏢 Employee Management System (EMS)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![.NET](https://img.shields.io/badge/.NET-8-purple?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Railway](https://img.shields.io/badge/Railway-Deployed-success?style=flat-square&logo=railway)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com/)

A comprehensive full-stack Employee Management System built with .NET 8 backend API and Next.js 14 frontend, featuring role-based access control, comprehensive HR functionality, and modern UI components.

**🔗 Live Application**: [https://ems-fullstack-net.vercel.app](https://ems-fullstack-net.vercel.app)  
**🔗 GitHub Repository**: [EMS-FULLSTACK-NET](https://github.com/jcuady/EMS-FULLSTACK-NET)

## 🎯 Current Status (Updated November 21, 2025)

**✅ PRODUCTION DEPLOYMENT COMPLETE:**  
**🌐 Frontend**: Deployed on Vercel - [ems-fullstack-net.vercel.app](https://ems-fullstack-net.vercel.app)  
**🚀 Backend API**: Deployed on Railway - [ems-fullstack-net-production.up.railway.app](https://ems-fullstack-net-production.up.railway.app)  
**🗄️ Database**: Supabase PostgreSQL with Redis caching  
**🔒 Security**: JWT authentication, CORS configured, HTTPS enabled  
**📊 Status**: 100% functional full-stack application

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```powershell
cd "C:\Users\joaxp\OneDrive\Documents\EMS"
.\start.ps1
```

## 🌐 Live Application Access

### 🚀 Production Deployment (LIVE)
**🔗 Frontend**: [https://ems-fullstack-net.vercel.app](https://ems-fullstack-net.vercel.app)  
**🔗 Backend API**: [https://ems-fullstack-net-production.up.railway.app](https://ems-fullstack-net-production.up.railway.app)

### 🔐 Demo Accounts (Ready to Use)
| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** | admin@ems.com | Admin123! | Full system access, user management, reports |
| **Manager** | manager@ems.com | Manager123! | Department management, employee oversight |
| **Employee** | employee@ems.com | Employee123! | Personal dashboard, time tracking |

### 💻 Local Development Setup

**Quick Start:**
```powershell
cd "C:\Users\joaxp\OneDrive\Documents\EMS"
.\start-complete.ps1
```

This will:
1. Start the .NET API on http://localhost:5000
2. Start the Next.js frontend on http://localhost:3002
3. Run the automated test suite

**Manual Startup:**

**Terminal 1 - Start API:**
```powershell
cd "C:\Users\joaxp\OneDrive\Documents\EMS"
dotnet run --project EmployeeMvp.csproj --urls "http://localhost:5000"
```

**Terminal 2 - Start Frontend:**
```powershell
cd "C:\Users\joaxp\OneDrive\Documents\EMS\frontend"
npm run dev
```

## 🚀 Latest Updates (November 2025)

### ✅ PRODUCTION DEPLOYMENT COMPLETE
- **🌐 Live Application**: Fully deployed and operational on Vercel + Railway
- **🔒 Security**: HTTPS enabled, CORS configured, JWT authentication working
- **📊 Performance**: Zero-downtime deployment with auto-scaling
- **🗄️ Database**: Supabase PostgreSQL with Redis caching active

### ✅ Enhanced Features Completed
- **🎨 Enhanced Frontend UI** - Professional dropdown menus, breadcrumb navigation
- **👤 Interactive Demo Users** - Clickable demo credentials on login page
- **🔐 Role-Based Access** - Admin/Manager/Employee with proper permissions
- **📊 Comprehensive Dashboard** - Real-time statistics and data visualization
- **🗂️ Complete CRUD Operations** - Employee, attendance, payroll management
- **📈 Database Population** - Realistic demo data for all user roles

### ✅ Fully Functional Features (Production Ready)

**🏠 Dashboard** - Employee and attendance statistics with charts  
**👥 Employees** - Complete employee management (list, view, search)  
**⏰ Attendance** - Attendance tracking and reporting  
**💰 Payroll** - Payroll processing and salary management  
**🔐 Authentication** - JWT-based security with role management  
**🔔 Notifications** - Real-time system notifications  
**🌐 API Integration** - Full frontend-backend communication

## 🧪 Testing

```powershell
.\test-api.ps1        # Full test suite (20 tests)
.\quick-test.ps1      # Quick validation (7 tests)
```

Test reports generated as: `test-results-YYYYMMDD-HHmmss.json`

## 📁 Project Structure

```
EMS/
├── Models/          - Domain models with Supabase mapping
├── DTOs/            - Data transfer objects with validation
├── Repositories/    - Data access layer
├── Controllers/     - REST API endpoints
├── Services/        - Supabase client factory
├── frontend/        - Next.js 14 application
├── test-api.ps1     - Automated test suite (475 lines)
├── start.ps1        - Startup script
└── API-STATUS.md    - Detailed API documentation
```

## 📖 Documentation

- **API-STATUS.md** - Complete API endpoint reference and status
- **.NET-BACKEND-GUIDE.md** - Backend architecture guide
- **README.md** - This file

## 🛠️ Tech Stack

### Backend
- **.NET 8** - Modern C# web API framework
- **ASP.NET Core** - High-performance web framework
- **Supabase** - PostgreSQL database with real-time features
- **JWT Authentication** - Secure token-based auth
- **Repository Pattern** - Clean architecture implementation

### Frontend  
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Context** - State management for authentication

### Infrastructure
- **Docker** - Containerization for both frontend and backend
- **Vercel** - Frontend deployment platform (ready)
- **GitHub** - Version control and CI/CD integration
- **PowerShell** - Automated testing and deployment scripts

## 📈 Key Features

### 🔐 Security & Authentication
- JWT-based authentication with BCrypt password hashing
- Role-based access control (Admin/Manager/Employee)
- Protected routes and API endpoints
- Secure environment variable management

### 👥 Employee Management
- Complete employee profiles with photo support
- Department and position management
- Performance tracking and ratings
- Employment status and contract management

### ⏰ Attendance & Time Tracking
- Clock in/out functionality with GPS tracking
- Overtime calculations and approvals
- Attendance reports and analytics
- Leave request integration

### 💰 Payroll Processing
- Automated payroll calculations
- Salary, bonus, and deduction management
- Tax calculations and compliance
- Payslip generation and distribution

### 📊 Analytics & Reporting
- Real-time dashboard with KPIs
- Custom report generation
- Data visualization with charts
- Export functionality (PDF, Excel)

### 🔔 Communication & Notifications
- Real-time notification system
- Email integration for important updates
- Activity feeds and audit logs
- Mobile-responsive design

## 👤 Demo Accounts

Test the system with these pre-configured accounts:

| Role | Email | Password | Features Available |
|------|-------|----------|-------------------|
| **Admin** | demo.admin@company.com | Admin123! | Full system access, user management |
| **Manager** | demo.manager@company.com | Manager123! | Team management, approvals |
| **Employee** | demo.employee@company.com | Employee123! | Personal data, leave requests |

## 🚀 Deployment Status

### 🎯 Deployment Success Metrics

- ✅ **Production Deployment**: Live on Vercel + Railway with HTTPS
- ✅ **GitHub Integration**: 260+ files, comprehensive documentation
- ✅ **Full-Stack Communication**: Frontend-backend integration working
- ✅ **Authentication System**: JWT working across environments
- ✅ **Database Integration**: Supabase + Redis successfully connected
- ✅ **CORS Configuration**: Cross-origin requests properly handled
- ✅ **Environment Management**: Production vs development configurations
- ✅ **Zero Build Errors**: Clean deployments on both platforms

## 🔗 Important Links

- **🌐 Live Application**: https://ems-fullstack-net.vercel.app
- **🚀 API Endpoint**: https://ems-fullstack-net-production.up.railway.app
- **📁 GitHub Repository**: https://github.com/jcuady/EMS-FULLSTACK-NET
- **📖 API Documentation**: See `API-STATUS.md`
- **🚀 Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

## 🏗️ Architecture

### 🎯 Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: .NET 8 Web API, Entity Framework Core
- **Database**: Supabase PostgreSQL + Redis caching
- **Authentication**: JWT tokens with role-based access
- **Deployment**: Vercel (frontend) + Railway (backend)
- **Version Control**: Git with GitHub integration

### 🌐 Production Infrastructure
- **Frontend Hosting**: Vercel with automatic deployments
- **Backend Hosting**: Railway with Docker containerization
- **Database**: Supabase managed PostgreSQL
- **Caching**: Redis for session and data caching
- **Security**: HTTPS, CORS, JWT authentication
- **Monitoring**: Built-in logging and error tracking

---

**🚀 Try it Live**: [ems-fullstack-net.vercel.app](https://ems-fullstack-net.vercel.app)  
**🔧 Local Setup**: Run `.\start.ps1` to launch development environment  
**📦 Docker**: Run `docker-compose up` for containerized deployment
