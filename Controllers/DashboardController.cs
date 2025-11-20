using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;
using EmployeeMvp.Services;

namespace EmployeeMvp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IPayrollRepository _payrollRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IEmployeeRepository employeeRepository,
        IAttendanceRepository attendanceRepository,
        IPayrollRepository payrollRepository,
        ICacheService cacheService,
        ILogger<DashboardController> logger)
    {
        _employeeRepository = employeeRepository;
        _attendanceRepository = attendanceRepository;
        _payrollRepository = payrollRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard statistics for admin (cached for 5 minutes)
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<DashboardStats>>> GetStatistics()
    {
        try
        {
            const string cacheKey = "dashboard:stats";
            
            // Try to get from cache first
            var cachedStats = await _cacheService.GetAsync<DashboardStats>(cacheKey);
            if (cachedStats != null)
            {
                _logger.LogInformation("⚡ Returning cached dashboard stats");
                return Ok(ApiResponse<DashboardStats>.SuccessResponse(
                    cachedStats,
                    "Dashboard statistics retrieved from cache"));
            }

            // Cache miss - calculate stats
            _logger.LogInformation("📊 Calculating dashboard stats...");
            
            var employees = await _employeeRepository.GetAllAsync();
            var allAttendance = await _attendanceRepository.GetAllAsync();
            var today = DateTime.UtcNow.Date;
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            // Total employees
            var totalEmployees = employees.Count;
            var activeEmployees = employees.Count; // Assuming all are active

            // Attendance rate (last 30 days)
            var thirtyDaysAgo = today.AddDays(-30);
            var recentAttendance = allAttendance
                .Where(a => a.Date >= thirtyDaysAgo)
                .ToList();

            var onTimeCount = recentAttendance
                .Count(a => a.Status == "On Time" || a.Status == "Present");
            var totalAttendanceCount = recentAttendance.Count;
            var attendanceRate = totalAttendanceCount > 0 
                ? Math.Round((decimal)onTimeCount / totalAttendanceCount * 100, 2)
                : 0;

            // Average performance rating
            var employeesWithRating = employees
                .Where(e => e.PerformanceRating.HasValue)
                .ToList();
            var avgPerformanceRating = employeesWithRating.Any()
                ? Math.Round((decimal)employeesWithRating.Average(e => e.PerformanceRating!.Value), 2)
                : 0;

            // Today's attendance
            var todayAttendance = allAttendance.Where(a => a.Date == today).ToList();
            var presentToday = todayAttendance.Count(a => a.Status == "Present" || a.Status == "On Time");
            var absentToday = totalEmployees - todayAttendance.Count;
            var lateToday = todayAttendance.Count(a => a.Status == "Late" || a.Status == "Very Late");

            // Current month payroll
            var allPayroll = await _payrollRepository.GetAllAsync();
            var currentMonthPayroll = allPayroll
                .Where(p => p.Month == currentMonth && p.Year == currentYear)
                .ToList();
            var totalPayrollThisMonth = currentMonthPayroll.Sum(p => p.NetSalary);

            var stats = new DashboardStats
            {
                TotalEmployees = totalEmployees,
                ActiveEmployees = activeEmployees,
                AttendanceRate = attendanceRate,
                AveragePerformanceRating = avgPerformanceRating,
                TotalPayrollThisMonth = totalPayrollThisMonth,
                PresentToday = presentToday,
                AbsentToday = absentToday,
                LateToday = lateToday
            };

            // Cache for 5 minutes
            await _cacheService.SetAsync(cacheKey, stats, TimeSpan.FromMinutes(5));

            return Ok(ApiResponse<DashboardStats>.SuccessResponse(
                stats,
                "Dashboard statistics calculated and cached"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dashboard statistics");
            return StatusCode(500, ApiResponse<DashboardStats>.ErrorResponse(
                "An error occurred while fetching dashboard statistics"));
        }
    }
}
