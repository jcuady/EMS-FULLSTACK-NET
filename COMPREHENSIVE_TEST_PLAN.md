# Comprehensive System Test Plan

This document outlines the deep analysis and testing strategy for the Employee Management System (EMS).

## 1. System Health Check
- [ ] **Backend API**: Verify running on `http://localhost:5000`
- [ ] **Frontend**: Verify running on `http://localhost:3000`
- [ ] **Database**: Verify connection to Supabase
- [ ] **Redis**: Verify connection (if enabled)

## 2. Authentication & Authorization
- [ ] **Registration**: Verify API handles password hashing (BCrypt) correctly.
- [ ] **Login**:
    - [ ] Admin (`admin@test.com`) -> 200 OK + JWT Token
    - [ ] Manager (`manager@test.com`) -> 200 OK + JWT Token
    - [ ] Employee (`employee@test.com`) -> 200 OK + JWT Token
- [ ] **Role Protection**:
    - [ ] Verify Employee cannot access Admin endpoints.

## 3. Feature Verification

### A. Dashboard
- [ ] **Stats**: Fetch `/api/dashboard/stats` (Requires Admin/Manager).

### B. Employee Management
- [ ] **List**: Fetch `/api/employees`.
- [ ] **Create**: POST `/api/employees` (Admin only).
- [ ] **Update**: PUT `/api/employees/{id}`.
- [ ] **Delete**: DELETE `/api/employees/{id}`.

### C. Attendance
- [ ] **Check-In**: POST `/api/attendance/check-in`.
- [ ] **Check-Out**: POST `/api/attendance/check-out`.
- [ ] **History**: GET `/api/attendance/my-history`.

### D. Leave Management
- [ ] **Apply**: POST `/api/leave/apply`.
- [ ] **Approve/Reject**: PUT `/api/leave/{id}/status` (Manager/Admin).

### E. Payroll
- [ ] **Process**: POST `/api/payroll/process` (Admin).
- [ ] **History**: GET `/api/payroll/history`.

### F. Reports
- [ ] **Generate**: GET `/api/reports/employees`.

### G. Audit & Notifications
- [ ] **Logs**: GET `/api/audit`.
- [ ] **Notifications**: GET `/api/notification`.

## 4. Automated Test Script
A PowerShell script `verify-all.ps1` will be created to automate these checks.

## 5. Execution Steps
1. **Clean Database**: Remove old users with invalid hashes.
2. **Seed Users**: Register users via API to generate valid hashes.
3. **Run Test Script**: Execute `verify-all.ps1`.
4. **Manual UI Check**: Log in to Frontend to verify UI integration.
