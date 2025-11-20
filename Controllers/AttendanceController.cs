using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;
using EmployeeMvp.Models;

namespace EmployeeMvp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AttendanceController> _logger;

    public AttendanceController(
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository,
        IUserRepository userRepository,
        ILogger<AttendanceController> logger)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all attendance records
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AttendanceResponse>>>> GetAll()
    {
        try
        {
            var attendanceRecords = await _attendanceRepository.GetAllAsync();
            var employees = await _employeeRepository.GetAllAsync();
            var users = await _userRepository.GetAllAsync();

            var response = attendanceRecords.Select(a =>
            {
                var employee = employees.FirstOrDefault(e => e.Id == a.EmployeeId);
                var user = employee != null ? users.FirstOrDefault(u => u.Id == employee.UserId) : null;
                
                return new AttendanceResponse
                {
                    Id = a.Id,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = user?.FullName ?? "Unknown",
                    Date = a.Date,
                    ClockIn = a.ClockIn,
                    ClockOut = a.ClockOut,
                    Status = a.Status,
                    Notes = a.Notes,
                    WorkingHours = CalculateWorkingHours(a.ClockIn, a.ClockOut),
                    CreatedAt = a.CreatedAt
                };
            }).ToList();

            return Ok(ApiResponse<List<AttendanceResponse>>.SuccessResponse(
                response,
                $"Retrieved {response.Count} attendance records"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all attendance records");
            return StatusCode(500, ApiResponse<List<AttendanceResponse>>.ErrorResponse(
                "An error occurred while fetching attendance records"));
        }
    }

    /// <summary>
    /// Get attendance by employee ID
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<ApiResponse<List<AttendanceResponse>>>> GetByEmployeeId(string employeeId)
    {
        try
        {
            var attendanceRecords = await _attendanceRepository.GetByEmployeeIdAsync(employeeId);
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            var user = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;

            var response = attendanceRecords.Select(a => new AttendanceResponse
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = user?.FullName ?? "Unknown",
                Date = a.Date,
                ClockIn = a.ClockIn,
                ClockOut = a.ClockOut,
                Status = a.Status,
                Notes = a.Notes,
                WorkingHours = CalculateWorkingHours(a.ClockIn, a.ClockOut),
                CreatedAt = a.CreatedAt
            }).ToList();

            return Ok(ApiResponse<List<AttendanceResponse>>.SuccessResponse(
                response,
                $"Retrieved {response.Count} attendance records"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance for employee: {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<List<AttendanceResponse>>.ErrorResponse(
                "An error occurred while fetching attendance records"));
        }
    }

    /// <summary>
    /// Clock in - creates today's attendance record
    /// </summary>
    [HttpPost("clock-in")]
    public async Task<ActionResult<ApiResponse<AttendanceResponse>>> ClockIn([FromBody] ClockInRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            // Check if already clocked in today
            var todayAttendance = await _attendanceRepository.GetTodayAttendanceAsync(request.EmployeeId);
            if (todayAttendance != null && todayAttendance.ClockIn != null)
            {
                return BadRequest(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Already clocked in today"));
            }

            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                return NotFound(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Employee not found"));
            }

            var now = DateTime.UtcNow;
            var attendance = new Attendance
            {
                EmployeeId = request.EmployeeId,
                Date = now.Date,
                ClockIn = now,
                Status = DetermineStatus(now),
                Notes = request.Notes
            };

            var created = await _attendanceRepository.CreateAsync(attendance);
            var user = await _userRepository.GetByIdAsync(employee.UserId);

            var response = new AttendanceResponse
            {
                Id = created.Id,
                EmployeeId = created.EmployeeId,
                EmployeeName = user?.FullName ?? "Unknown",
                Date = created.Date,
                ClockIn = created.ClockIn,
                ClockOut = created.ClockOut,
                Status = created.Status,
                Notes = created.Notes,
                WorkingHours = CalculateWorkingHours(created.ClockIn, created.ClockOut),
                CreatedAt = created.CreatedAt
            };

            _logger.LogInformation("Employee clocked in: {EmployeeId} at {Time}", request.EmployeeId, now);

            return Ok(ApiResponse<AttendanceResponse>.SuccessResponse(
                response,
                "Clocked in successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during clock in for employee: {EmployeeId}. Message: {Message}", 
                request.EmployeeId, ex.Message);
            return StatusCode(500, ApiResponse<AttendanceResponse>.ErrorResponse(
                $"An error occurred during clock in: {ex.Message}"));
        }
    }

    /// <summary>
    /// Clock out - updates today's attendance record
    /// </summary>
    [HttpPost("clock-out")]
    public async Task<ActionResult<ApiResponse<AttendanceResponse>>> ClockOut([FromBody] ClockOutRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            var attendance = await _attendanceRepository.GetByIdAsync(request.AttendanceId);
            
            if (attendance == null)
            {
                return NotFound(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Attendance record not found"));
            }

            if (attendance.ClockOut.HasValue)
            {
                return BadRequest(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Already clocked out"));
            }

            attendance.ClockOut = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Notes))
                attendance.Notes = request.Notes;

            var updated = await _attendanceRepository.UpdateAsync(attendance);
            
            var employee = await _employeeRepository.GetByIdAsync(updated.EmployeeId);
            var user = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;

            var response = new AttendanceResponse
            {
                Id = updated.Id,
                EmployeeId = updated.EmployeeId,
                EmployeeName = user?.FullName ?? "Unknown",
                Date = updated.Date,
                ClockIn = updated.ClockIn,
                ClockOut = updated.ClockOut,
                Status = updated.Status,
                Notes = updated.Notes,
                WorkingHours = CalculateWorkingHours(updated.ClockIn, updated.ClockOut),
                CreatedAt = updated.CreatedAt
            };

            _logger.LogInformation("Employee clocked out: {EmployeeId} at {Time}", 
                updated.EmployeeId, updated.ClockOut);

            return Ok(ApiResponse<AttendanceResponse>.SuccessResponse(
                response,
                "Clocked out successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during clock out");
            return StatusCode(500, ApiResponse<AttendanceResponse>.ErrorResponse(
                "An error occurred during clock out"));
        }
    }

    /// <summary>
    /// Create attendance record (admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<AttendanceResponse>>> Create([FromBody] CreateAttendanceRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                return NotFound(ApiResponse<AttendanceResponse>.ErrorResponse(
                    "Employee not found"));
            }

            var attendance = new Attendance
            {
                EmployeeId = request.EmployeeId,
                Date = request.Date.Date,
                ClockIn = request.ClockIn,
                ClockOut = request.ClockOut,
                Status = request.Status,
                Notes = request.Notes
            };

            var created = await _attendanceRepository.CreateAsync(attendance);
            
            // Get user info safely (GetByIdAsync can return null if user not found)
            string employeeName = "Unknown";
            try
            {
                var user = await _userRepository.GetByIdAsync(employee.UserId);
                employeeName = user?.FullName ?? "Unknown";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch user for employee {EmployeeId}", employee.UserId);
            }

            var response = new AttendanceResponse
            {
                Id = created.Id,
                EmployeeId = created.EmployeeId,
                EmployeeName = employeeName,
                Date = created.Date,
                ClockIn = created.ClockIn,
                ClockOut = created.ClockOut,
                Status = created.Status,
                Notes = created.Notes,
                WorkingHours = CalculateWorkingHours(created.ClockIn, created.ClockOut),
                CreatedAt = created.CreatedAt
            };

            _logger.LogInformation("Attendance record created by admin for employee: {EmployeeId}", 
                request.EmployeeId);

            return CreatedAtAction(
                "GetByEmployeeId",
                new { employeeId = created.EmployeeId },
                ApiResponse<AttendanceResponse>.SuccessResponse(
                    response,
                    "Attendance record created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating attendance for employee: {EmployeeId}. Message: {Message}", 
                request.EmployeeId, ex.Message);
            return StatusCode(500, ApiResponse<AttendanceResponse>.ErrorResponse(
                $"An error occurred while creating attendance: {ex.Message}"));
        }
    }

    /// <summary>
    /// Delete attendance record
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        try
        {
            var attendance = await _attendanceRepository.GetByIdAsync(id);
            
            if (attendance == null)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(
                    $"Attendance record not found with ID: {id}"));
            }

            var result = await _attendanceRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogInformation("Attendance record deleted: {Id}", id);
                return Ok(ApiResponse<bool>.SuccessResponse(
                    true,
                    "Attendance record deleted successfully"));
            }

            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Failed to delete attendance record"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attendance record: {Id}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "An error occurred while deleting attendance record"));
        }
    }

    // Helper methods
    private string CalculateWorkingHours(DateTime? clockIn, DateTime? clockOut)
    {
        if (!clockIn.HasValue) return "0h 0m";
        if (!clockOut.HasValue) return "In Progress";

        var duration = clockOut.Value - clockIn.Value;
        return $"{(int)duration.TotalHours}h {duration.Minutes}m";
    }

    private string DetermineStatus(DateTime clockInTime)
    {
        // Assume work starts at 9:00 AM
        var startTime = new TimeSpan(9, 0, 0);
        var clockInTimeOfDay = clockInTime.TimeOfDay;

        if (clockInTimeOfDay <= startTime)
            return "On Time";
        else if (clockInTimeOfDay <= startTime.Add(TimeSpan.FromMinutes(15)))
            return "Late";
        else
            return "Very Late";
    }
}
