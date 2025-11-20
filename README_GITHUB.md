# 🏢 EMS - Employee Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![.NET](https://img.shields.io/badge/.NET-8-purple?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

A comprehensive, full-stack Employee Management System built with modern technologies, featuring role-based access control, real-time notifications, and comprehensive HR functionality.

## 🚀 Live Demo

- **Frontend**: Deployed on Vercel
- **Backend API**: .NET 8 Web API
- **Database**: Supabase PostgreSQL

## ✨ Features

### 👥 Employee Management
- Complete employee profiles and records
- Department and position management
- Performance tracking and ratings
- Employment status and type management

### ⏰ Attendance Tracking
- Clock in/out functionality
- Overtime calculations
- Attendance reports and analytics
- Absence tracking

### 🏖️ Leave Management
- Leave request submission and approval
- Multiple leave types (Annual, Sick, Personal)
- Leave balance tracking
- Approval workflow with notifications

### 💰 Payroll Processing
- Automated payroll calculations
- Salary and bonus management
- Deduction handling
- Payslip generation

### 🔐 Security & Access Control
- JWT-based authentication
- Role-based access control (Admin, Manager, Employee)
- BCrypt password hashing
- Protected routes and API endpoints

### 🔔 Real-time Features
- Live notifications
- Status updates
- Activity feeds

## 🛠️ Technology Stack

### Backend
- **Framework**: .NET 8 Web API
- **ORM**: Entity Framework Core
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT with BCrypt
- **Caching**: Redis
- **Architecture**: Clean Architecture with Repository Pattern

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Authentication**: JWT tokens with HTTP-only cookies

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- .NET 8 SDK
- Docker Desktop (optional)
- Supabase account

### 1️⃣ Clone Repository
```bash
git clone https://github.com/jcuady/EMS-FULLSTACK-NET.git
cd EMS-FULLSTACK-NET
```

### 2️⃣ Backend Setup
```bash
# Install .NET dependencies
dotnet restore

# Update configuration
cp appsettings.Development.json appsettings.json
# Update connection strings and JWT settings

# Start the API
dotnet run --urls "http://localhost:5000"
```

### 3️⃣ Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Update NEXT_PUBLIC_API_URL=http://localhost:5000

# Start development server
npm run dev
```

### 4️⃣ Quick Start Script
```bash
# Use the automated startup script (Windows)
.\start.ps1
```

## 🔧 Environment Configuration

### Backend (.env)
```env
ConnectionStrings__DefaultConnection=your_supabase_connection_string
JwtSettings__Key=your_super_secret_jwt_key_here
JwtSettings__Issuer=EMS-API
JwtSettings__Audience=EMS-Client
JwtSettings__ExpireMinutes=60
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 👤 Demo Accounts

The system comes with pre-configured demo accounts for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | demo.admin@company.com | Admin123! | Full system access |
| **Manager** | demo.manager@company.com | Manager123! | Department management |
| **Employee** | demo.employee@company.com | Employee123! | Personal data only |

## 🎯 Current Status

**API Status:** ✅ 70% Test Pass Rate (14/20 endpoints fully working)  
**Frontend:** ✅ Fully functional with all features  
**Build:** ✅ 0 errors, 0 warnings

### ✅ Fully Functional Features
- **Dashboard** - Employee and attendance statistics  
- **Employees** - Complete CRUD operations  
- **Attendance** - View and manage attendance records  
- **Payroll** - Payroll processing and reports  
- **Authentication** - JWT-based security  
- **Role Management** - Admin/Manager/Employee roles

## 🧪 Testing

### Automated Test Suite
```bash
# Full test suite (20 tests)
.\test-api.ps1

# Quick validation (7 tests)  
.\quick-test.ps1
```

Test reports generated as: `test-results-YYYYMMDD-HHmmss.json`

## 📊 Database Schema

The system uses a comprehensive database schema with:

- **Users**: Authentication and user management
- **Employees**: Employee profiles and information  
- **Departments**: Organizational structure
- **Attendance**: Clock in/out records
- **Leaves**: Leave requests and approvals
- **Payroll**: Salary and payment records
- **Notifications**: Real-time system notifications

## 🔄 API Documentation

The backend API provides RESTful endpoints:

- **Authentication**: `/api/auth/*`
- **Employees**: `/api/employees/*`
- **Attendance**: `/api/attendance/*`
- **Leaves**: `/api/leaves/*`
- **Payroll**: `/api/payroll/*`
- **Departments**: `/api/departments/*`
- **Dashboard**: `/api/dashboard/*`

## 📁 Project Structure

```
EMS/
├── Models/          # Domain models with Supabase mapping
├── DTOs/            # Data transfer objects with validation
├── Repositories/    # Data access layer
├── Controllers/     # REST API endpoints
├── Services/        # Business logic and Supabase client
├── frontend/        # Next.js 14 application
│   ├── app/         # Next.js App Router
│   ├── components/  # Reusable UI components
│   ├── contexts/    # React Context providers
│   └── lib/         # Utilities and helpers
├── Scripts/         # PowerShell automation scripts
└── Documentation/   # API and system documentation
```

## 🚀 Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment:

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Set `NEXT_PUBLIC_API_URL` in Vercel dashboard
3. **Build Settings**: 
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Backend Options
- **Railway**: Easy .NET deployment with PostgreSQL
- **Render**: Free tier with automatic builds
- **Azure**: Enterprise-grade hosting
- **Digital Ocean**: App Platform

### Vercel Configuration
The project includes a `vercel.json` in the frontend directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Microsoft for .NET 8
- Supabase for the backend infrastructure
- Radix UI for accessible components
- Tailwind CSS for utility-first styling

## 📞 Support

For support and questions:
- Create an issue in this repository
- Email: support@ems-system.com

---

**Built with ❤️ using .NET 8 and Next.js 14**