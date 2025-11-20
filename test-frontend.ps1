#!/usr/bin/env pwsh
# Frontend UI Test Script - Tests all pages and user flows

$FrontendUrl = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🌐 FRONTEND UI TEST CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Frontend URL: $FrontendUrl`n" -ForegroundColor White

# Test if frontend is running
Write-Host "Checking if frontend is accessible..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ Frontend is running!" -ForegroundColor Green
    }
}
catch {
    Write-Host " ❌ Frontend is not accessible" -ForegroundColor Red
    Write-Host "Please start the frontend with: cd frontend; npm run dev`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 MANUAL TESTING CHECKLIST" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "🔐 AUTHENTICATION FLOW" -ForegroundColor Cyan
Write-Host "   1. [ ] Login Page (http://localhost:3000/login)" -ForegroundColor White
Write-Host "      - Login with: admin@test.com / Admin@123" -ForegroundColor Gray
Write-Host "      - Check error handling for wrong credentials" -ForegroundColor Gray
Write-Host "      - Verify redirect to dashboard after login" -ForegroundColor Gray

Write-Host "`n📊 DASHBOARD" -ForegroundColor Cyan
Write-Host "   2. [ ] Admin Dashboard (http://localhost:3000/dashboard)" -ForegroundColor White
Write-Host "      - View statistics cards (employees, attendance, etc.)" -ForegroundColor Gray
Write-Host "      - Check recent activity feed" -ForegroundColor Gray
Write-Host "      - Verify charts and graphs load" -ForegroundColor Gray
Write-Host "   3. [ ] Employee Dashboard (http://localhost:3000/employee/dashboard)" -ForegroundColor White
Write-Host "      - View personal stats" -ForegroundColor Gray
Write-Host "      - Check attendance summary" -ForegroundColor Gray

Write-Host "`n👥 EMPLOYEE MANAGEMENT" -ForegroundColor Cyan
Write-Host "   4. [ ] Employee List (http://localhost:3000/employees)" -ForegroundColor White
Write-Host "      - View all employees in table" -ForegroundColor Gray
Write-Host "      - Search/filter employees" -ForegroundColor Gray
Write-Host "      - Click 'Add Employee' button" -ForegroundColor Gray
Write-Host "      - Edit employee details" -ForegroundColor Gray
Write-Host "      - Delete employee" -ForegroundColor Gray

Write-Host "`n⏰ ATTENDANCE TRACKING" -ForegroundColor Cyan
Write-Host "   5. [ ] Attendance Page (http://localhost:3000/attendance)" -ForegroundColor White
Write-Host "      - View attendance records table" -ForegroundColor Gray
Write-Host "      - Filter by date range" -ForegroundColor Gray
Write-Host "      - Export attendance data" -ForegroundColor Gray
Write-Host "   6. [ ] Working Tracker (http://localhost:3000/working-tracker)" -ForegroundColor White
Write-Host "      - Clock In with notes" -ForegroundColor Gray
Write-Host "      - Clock Out with notes" -ForegroundColor Gray
Write-Host "      - View real-time work duration" -ForegroundColor Gray

Write-Host "`n💰 PAYROLL MANAGEMENT" -ForegroundColor Cyan
Write-Host "   7. [ ] Payroll List (http://localhost:3000/payroll)" -ForegroundColor White
Write-Host "      - View payroll records" -ForegroundColor Gray
Write-Host "      - Filter by employee/date" -ForegroundColor Gray
Write-Host "      - Generate new payroll" -ForegroundColor Gray
Write-Host "      - View payroll details" -ForegroundColor Gray

Write-Host "`n🏖️ LEAVE MANAGEMENT" -ForegroundColor Cyan
Write-Host "   8. [ ] Leave List (http://localhost:3000/leaves)" -ForegroundColor White
Write-Host "      - View all leave requests" -ForegroundColor Gray
Write-Host "      - Filter by status/type" -ForegroundColor Gray
Write-Host "   9. [ ] Request Leave (http://localhost:3000/leaves/request)" -ForegroundColor White
Write-Host "      - Select leave type (Annual, Sick, etc.)" -ForegroundColor Gray
Write-Host "      - Choose date range" -ForegroundColor Gray
Write-Host "      - Add reason" -ForegroundColor Gray
Write-Host "      - Submit request" -ForegroundColor Gray
Write-Host "      - View leave balance" -ForegroundColor Gray
Write-Host "   10. [ ] Pending Approvals (http://localhost:3000/leaves/pending)" -ForegroundColor White
Write-Host "      - View pending leave requests (Admin/Manager)" -ForegroundColor Gray
Write-Host "      - Approve leave request" -ForegroundColor Gray
Write-Host "      - Reject with reason" -ForegroundColor Gray

Write-Host "`n📊 REPORTS & ANALYTICS" -ForegroundColor Cyan
Write-Host "   11. [ ] Reports Page (http://localhost:3000/reports)" -ForegroundColor White
Write-Host "      - Select Employee Report → Generate PDF" -ForegroundColor Gray
Write-Host "      - Select Attendance Report → Generate Excel" -ForegroundColor Gray
Write-Host "      - Select Payroll Report → Generate PDF" -ForegroundColor Gray
Write-Host "      - Select Leave Report → Generate Excel" -ForegroundColor Gray
Write-Host "      - Set date range filters" -ForegroundColor Gray
Write-Host "      - Verify file downloads" -ForegroundColor Gray

Write-Host "`n🔔 NOTIFICATIONS" -ForegroundColor Cyan
Write-Host "   12. [ ] Notifications (http://localhost:3000/notifications)" -ForegroundColor White
Write-Host "      - View all notifications" -ForegroundColor Gray
Write-Host "      - Filter unread/read" -ForegroundColor Gray
Write-Host "      - Mark as read" -ForegroundColor Gray
Write-Host "      - Mark all as read" -ForegroundColor Gray
Write-Host "      - Delete notification" -ForegroundColor Gray

Write-Host "`n📜 AUDIT LOGS" -ForegroundColor Cyan
Write-Host "   13. [ ] Audit Viewer (http://localhost:3000/audit)" -ForegroundColor White
Write-Host "      - View audit log entries (Admin only)" -ForegroundColor Gray
Write-Host "      - Filter by entity type" -ForegroundColor Gray
Write-Host "      - Filter by action" -ForegroundColor Gray
Write-Host "      - Filter by date range" -ForegroundColor Gray
Write-Host "      - View change details (JSON diff)" -ForegroundColor Gray
Write-Host "      - Pagination works correctly" -ForegroundColor Gray

Write-Host "`n❓ HELP & SUPPORT" -ForegroundColor Cyan
Write-Host "   14. [ ] Help Page (http://localhost:3000/help)" -ForegroundColor White
Write-Host "      - View FAQ accordion" -ForegroundColor Gray
Write-Host "      - Submit contact form" -ForegroundColor Gray
Write-Host "      - View user guides" -ForegroundColor Gray

Write-Host "`n🎨 UI/UX CHECKS" -ForegroundColor Cyan
Write-Host "   15. [ ] Navigation & Layout" -ForegroundColor White
Write-Host "      - Sidebar navigation works" -ForegroundColor Gray
Write-Host "      - All menu items accessible" -ForegroundColor Gray
Write-Host "      - User menu (profile/logout) works" -ForegroundColor Gray
Write-Host "      - Responsive design (resize browser)" -ForegroundColor Gray
Write-Host "   16. [ ] Forms & Validation" -ForegroundColor White
Write-Host "      - Required field validation" -ForegroundColor Gray
Write-Host "      - Email format validation" -ForegroundColor Gray
Write-Host "      - Date picker works" -ForegroundColor Gray
Write-Host "      - Error messages display" -ForegroundColor Gray
Write-Host "      - Success messages display" -ForegroundColor Gray
Write-Host "   17. [ ] Data Tables" -ForegroundColor White
Write-Host "      - Sorting columns works" -ForegroundColor Gray
Write-Host "      - Pagination works" -ForegroundColor Gray
Write-Host "      - Search/filter works" -ForegroundColor Gray
Write-Host "      - Actions (edit/delete) work" -ForegroundColor Gray

Write-Host "`n🔒 SECURITY CHECKS" -ForegroundColor Cyan
Write-Host "   18. [ ] Authorization" -ForegroundColor White
Write-Host "      - Admin-only pages blocked for employees" -ForegroundColor Gray
Write-Host "      - Logout clears session" -ForegroundColor Gray
Write-Host "      - Protected routes redirect to login" -ForegroundColor Gray
Write-Host "   19. [ ] Role-Based Access" -ForegroundColor White
Write-Host "      - Admin sees all features" -ForegroundColor Gray
Write-Host "      - Manager sees approval features" -ForegroundColor Gray
Write-Host "      - Employee sees limited features" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ QUICK TEST URLS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$urls = @(
    "http://localhost:3000",
    "http://localhost:3000/login",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/employees",
    "http://localhost:3000/attendance",
    "http://localhost:3000/working-tracker",
    "http://localhost:3000/payroll",
    "http://localhost:3000/leaves",
    "http://localhost:3000/leaves/request",
    "http://localhost:3000/leaves/pending",
    "http://localhost:3000/reports",
    "http://localhost:3000/notifications",
    "http://localhost:3000/audit",
    "http://localhost:3000/help"
)

Write-Host "Opening key pages in browser...`n" -ForegroundColor Yellow

foreach ($url in $urls) {
    Write-Host "   $url" -ForegroundColor Gray
}

Write-Host "`n💡 TIP: Open browser DevTools (F12) to check for console errors`n" -ForegroundColor Yellow

# Ask if user wants to open all pages
$response = Read-Host "Open all test URLs in browser? (y/n)"
if ($response -eq 'y') {
    Start-Process $urls[0]  # Just open the main page
    Write-Host "`n✅ Browser opened! Navigate through the app manually.`n" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 Save this checklist and mark items as you test!" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
