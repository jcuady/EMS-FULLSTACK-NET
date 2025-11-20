using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmployeeMvp.DTOs;
using EmployeeMvp.Services;
using System.Security.Claims;

namespace EmployeeMvp.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        IReportService reportService,
        ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    /// <summary>
    /// Generate employee report (PDF or Excel)
    /// </summary>
    [HttpPost("employees")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> GenerateEmployeeReport([FromBody] ReportRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid request data"));
            }

            if (request.ReportType?.ToLower() != "employees")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid report type"));
            }

            var format = request.ExportFormat?.ToLower();
            if (format != "pdf" && format != "excel")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Export format must be 'pdf' or 'excel'"));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
            var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

            var reportBytes = await _reportService.GenerateEmployeeReportAsync(request, userName);

            var fileName = $"Employee_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{(format == "pdf" ? "pdf" : "xlsx")}";
            var contentType = format == "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            return File(reportBytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating employee report");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to generate employee report"));
        }
    }

    /// <summary>
    /// Generate attendance report (PDF or Excel)
    /// </summary>
    [HttpPost("attendance")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> GenerateAttendanceReport([FromBody] ReportRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid request data"));
            }

            if (request.ReportType?.ToLower() != "attendance")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid report type"));
            }

            var format = request.ExportFormat?.ToLower();
            if (format != "pdf" && format != "excel")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Export format must be 'pdf' or 'excel'"));
            }

            if (!request.StartDate.HasValue || !request.EndDate.HasValue)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Start date and end date are required for attendance reports"));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
            var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

            var reportBytes = await _reportService.GenerateAttendanceReportAsync(request, userName);

            var fileName = $"Attendance_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{(format == "pdf" ? "pdf" : "xlsx")}";
            var contentType = format == "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            return File(reportBytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating attendance report");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to generate attendance report"));
        }
    }

    /// <summary>
    /// Generate payroll report (PDF or Excel)
    /// </summary>
    [HttpPost("payroll")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> GeneratePayrollReport([FromBody] ReportRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid request data"));
            }

            if (request.ReportType?.ToLower() != "payroll")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid report type"));
            }

            var format = request.ExportFormat?.ToLower();
            if (format != "pdf" && format != "excel")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Export format must be 'pdf' or 'excel'"));
            }

            if (!request.StartDate.HasValue || !request.EndDate.HasValue)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Start date and end date are required for payroll reports"));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
            var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

            var reportBytes = await _reportService.GeneratePayrollReportAsync(request, userName);

            var fileName = $"Payroll_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{(format == "pdf" ? "pdf" : "xlsx")}";
            var contentType = format == "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            return File(reportBytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating payroll report");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to generate payroll report"));
        }
    }

    /// <summary>
    /// Generate leave report (PDF or Excel)
    /// </summary>
    [HttpPost("leave")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> GenerateLeaveReport([FromBody] ReportRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid request data"));
            }

            if (request.ReportType?.ToLower() != "leave")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid report type"));
            }

            var format = request.ExportFormat?.ToLower();
            if (format != "pdf" && format != "excel")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Export format must be 'pdf' or 'excel'"));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
            var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

            var reportBytes = await _reportService.GenerateLeaveReportAsync(request, userName);

            var fileName = $"Leave_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{(format == "pdf" ? "pdf" : "xlsx")}";
            var contentType = format == "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            return File(reportBytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating leave report");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to generate leave report"));
        }
    }
}
