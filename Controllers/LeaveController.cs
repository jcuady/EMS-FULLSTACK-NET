using EmployeeMvp.DTOs;
using EmployeeMvp.Models;
using EmployeeMvp.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeMvp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<LeaveController> _logger;

    public LeaveController(
        ILeaveRepository leaveRepository,
        ILeaveBalanceRepository leaveBalanceRepository,
        IEmployeeRepository employeeRepository,
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        ILogger<LeaveController> logger)
    {
        _leaveRepository = leaveRepository;
        _leaveBalanceRepository = leaveBalanceRepository;
        _employeeRepository = employeeRepository;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
    }

    /// <summary>
    /// Get all leaves (Admin/Manager) or own leaves (Employee)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<LeaveResponse>>>> GetAll([FromQuery] string? status = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
                return Unauthorized(ApiResponse<List<LeaveResponse>>.ErrorResponse("User not found"));

            List<Leave> leaves;

            // Admin/Manager can see all leaves, Employee sees only their own
            if (user.Role == "Admin" || user.Role == "Manager")
            {
                leaves = string.IsNullOrEmpty(status) 
                    ? await _leaveRepository.GetAllAsync()
                    : await _leaveRepository.GetByStatusAsync(status);
            }
            else
            {
                var employee = await _employeeRepository.GetByUserIdAsync(userId);
                if (employee == null)
                    return NotFound(ApiResponse<List<LeaveResponse>>.ErrorResponse("Employee record not found"));

                leaves = await _leaveRepository.GetByEmployeeAsync(employee.Id);
                
                if (!string.IsNullOrEmpty(status))
                    leaves = leaves.Where(l => l.Status == status).ToList();
            }

            var employees = await _employeeRepository.GetAllAsync();
            var users = await _userRepository.GetAllAsync();

            var response = leaves.Select(l =>
            {
                var employee = employees.FirstOrDefault(e => e.Id == l.EmployeeId);
                var empUser = employee != null ? users.FirstOrDefault(u => u.Id == employee.UserId) : null;
                var approver = l.ApprovedBy != null ? users.FirstOrDefault(u => u.Id == l.ApprovedBy) : null;

                return new LeaveResponse
                {
                    Id = l.Id,
                    EmployeeId = l.EmployeeId,
                    EmployeeName = empUser?.FullName ?? "Unknown",
                    EmployeeCode = employee?.EmployeeCode ?? "",
                    Department = employee?.Department?.Name ?? "N/A",
                    LeaveType = l.LeaveType,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    DaysCount = l.DaysCount,
                    Reason = l.Reason,
                    Status = l.Status,
                    ApprovedBy = l.ApprovedBy,
                    ApprovedByName = approver?.FullName,
                    ApprovedAt = l.ApprovedAt,
                    RejectionReason = l.RejectionReason,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                };
            }).ToList();

            return Ok(ApiResponse<List<LeaveResponse>>.SuccessResponse(response, "Leaves retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leaves");
            return StatusCode(500, ApiResponse<List<LeaveResponse>>.ErrorResponse("Error retrieving leaves"));
        }
    }

    /// <summary>
    /// Get pending leaves for manager approval
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<List<LeaveResponse>>>> GetPendingLeaves()
    {
        try
        {
            var userId = GetCurrentUserId();
            var leaves = await _leaveRepository.GetPendingByManagerAsync(userId);

            var employees = await _employeeRepository.GetAllAsync();
            var users = await _userRepository.GetAllAsync();

            var response = leaves.Select(l =>
            {
                var employee = employees.FirstOrDefault(e => e.Id == l.EmployeeId);
                var empUser = employee != null ? users.FirstOrDefault(u => u.Id == employee.UserId) : null;

                return new LeaveResponse
                {
                    Id = l.Id,
                    EmployeeId = l.EmployeeId,
                    EmployeeName = empUser?.FullName ?? "Unknown",
                    EmployeeCode = employee?.EmployeeCode ?? "",
                    Department = employee?.Department?.Name ?? "N/A",
                    LeaveType = l.LeaveType,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    DaysCount = l.DaysCount,
                    Reason = l.Reason,
                    Status = l.Status,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                };
            }).ToList();

            return Ok(ApiResponse<List<LeaveResponse>>.SuccessResponse(response, "Pending leaves retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending leaves");
            return StatusCode(500, ApiResponse<List<LeaveResponse>>.ErrorResponse("Error retrieving pending leaves"));
        }
    }

    /// <summary>
    /// Get leave by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<LeaveResponse>>> GetById(string id)
    {
        try
        {
            var leave = await _leaveRepository.GetByIdAsync(id);
            if (leave == null)
                return NotFound(ApiResponse<LeaveResponse>.ErrorResponse("Leave not found"));

            var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId);
            var empUser = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;
            var approver = leave.ApprovedBy != null ? await _userRepository.GetByIdAsync(leave.ApprovedBy) : null;

            var response = new LeaveResponse
            {
                Id = leave.Id,
                EmployeeId = leave.EmployeeId,
                EmployeeName = empUser?.FullName ?? "Unknown",
                EmployeeCode = employee?.EmployeeCode ?? "",
                Department = employee?.Department?.Name ?? "N/A",
                LeaveType = leave.LeaveType,
                StartDate = leave.StartDate,
                EndDate = leave.EndDate,
                DaysCount = leave.DaysCount,
                Reason = leave.Reason,
                Status = leave.Status,
                ApprovedBy = leave.ApprovedBy,
                ApprovedByName = approver?.FullName,
                ApprovedAt = leave.ApprovedAt,
                RejectionReason = leave.RejectionReason,
                CreatedAt = leave.CreatedAt,
                UpdatedAt = leave.UpdatedAt
            };

            return Ok(ApiResponse<LeaveResponse>.SuccessResponse(response, "Leave retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave: {Id}", id);
            return StatusCode(500, ApiResponse<LeaveResponse>.ErrorResponse("Error retrieving leave"));
        }
    }

    /// <summary>
    /// Request a new leave
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<LeaveResponse>>> RequestLeave([FromBody] CreateLeaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse("Validation failed"));

            // Validate dates
            if (request.EndDate < request.StartDate)
                return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse("End date must be after start date"));

            if (request.StartDate < DateTime.UtcNow.Date)
                return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse("Cannot request leave for past dates"));

            // Check for overlapping leaves
            var hasOverlap = await _leaveRepository.HasOverlappingLeaveAsync(
                request.EmployeeId, request.StartDate, request.EndDate);
            
            if (hasOverlap)
                return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse("You already have a leave request for these dates"));

            // Calculate days
            int daysCount = (request.EndDate - request.StartDate).Days + 1;

            // Check leave balance (except for unpaid leave)
            if (request.LeaveType.ToLower() != "unpaid")
            {
                var year = request.StartDate.Year;
                var hasSufficient = await _leaveBalanceRepository.HasSufficientBalanceAsync(
                    request.EmployeeId, year, request.LeaveType, daysCount);

                if (!hasSufficient)
                    return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse($"Insufficient {request.LeaveType} leave balance"));
            }

            var leave = new Leave
            {
                EmployeeId = request.EmployeeId,
                LeaveType = request.LeaveType,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                DaysCount = daysCount,
                Reason = request.Reason,
                Status = "Pending"
            };

            var created = await _leaveRepository.CreateAsync(leave);

            // Send notification to managers
            await _notificationRepository.CreateAsync(new Notification
            {
                UserId = request.EmployeeId, // This should be manager's ID in production
                Title = "New Leave Request",
                Message = $"A new {request.LeaveType} leave request has been submitted",
                Type = "info",
                Link = $"/leaves/{created.Id}"
            });

            var employee = await _employeeRepository.GetByIdAsync(created.EmployeeId);
            var empUser = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;

            var response = new LeaveResponse
            {
                Id = created.Id,
                EmployeeId = created.EmployeeId,
                EmployeeName = empUser?.FullName ?? "Unknown",
                EmployeeCode = employee?.EmployeeCode ?? "",
                Department = employee?.Department?.Name ?? "N/A",
                LeaveType = created.LeaveType,
                StartDate = created.StartDate,
                EndDate = created.EndDate,
                DaysCount = created.DaysCount,
                Reason = created.Reason,
                Status = created.Status,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, 
                ApiResponse<LeaveResponse>.SuccessResponse(response, "Leave request submitted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave request");
            return StatusCode(500, ApiResponse<LeaveResponse>.ErrorResponse("Error creating leave request"));
        }
    }

    /// <summary>
    /// Approve a leave request (Manager/Admin only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<LeaveResponse>>> ApproveLeave(string id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var leave = await _leaveRepository.GetByIdAsync(id);

            if (leave == null)
                return NotFound(ApiResponse<LeaveResponse>.ErrorResponse("Leave not found"));

            if (leave.Status != "Pending")
                return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse("Only pending leaves can be approved"));

            // Approve the leave
            var approved = await _leaveRepository.ApproveLeaveAsync(id, userId);

            // Deduct from leave balance
            if (leave.LeaveType.ToLower() != "unpaid")
            {
                var year = leave.StartDate.Year;
                await _leaveBalanceRepository.DeductLeaveAsync(leave.EmployeeId, year, leave.LeaveType, leave.DaysCount);
            }

            // Send notification to employee
            var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId);
            if (employee != null)
            {
                await _notificationRepository.CreateAsync(new Notification
                {
                    UserId = employee.UserId,
                    Title = "Leave Request Approved",
                    Message = $"Your {leave.LeaveType} leave request from {leave.StartDate:MMM dd} to {leave.EndDate:MMM dd} has been approved",
                    Type = "success",
                    Link = $"/leaves/{id}"
                });
            }

            var empUser = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;
            var approver = await _userRepository.GetByIdAsync(userId);

            var response = new LeaveResponse
            {
                Id = approved.Id,
                EmployeeId = approved.EmployeeId,
                EmployeeName = empUser?.FullName ?? "Unknown",
                EmployeeCode = employee?.EmployeeCode ?? "",
                Department = employee?.Department?.Name ?? "N/A",
                LeaveType = approved.LeaveType,
                StartDate = approved.StartDate,
                EndDate = approved.EndDate,
                DaysCount = approved.DaysCount,
                Reason = approved.Reason,
                Status = approved.Status,
                ApprovedBy = approved.ApprovedBy,
                ApprovedByName = approver?.FullName,
                ApprovedAt = approved.ApprovedAt,
                CreatedAt = approved.CreatedAt,
                UpdatedAt = approved.UpdatedAt
            };

            return Ok(ApiResponse<LeaveResponse>.SuccessResponse(response, "Leave approved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving leave: {Id}", id);
            return StatusCode(500, ApiResponse<LeaveResponse>.ErrorResponse("Error approving leave"));
        }
    }

    /// <summary>
    /// Reject a leave request (Manager/Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<LeaveResponse>>> RejectLeave(string id, [FromBody] RejectLeaveRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var leave = await _leaveRepository.GetByIdAsync(id);

            if (leave == null)
                return NotFound(ApiResponse<LeaveResponse>.ErrorResponse("Leave not found"));

            if (leave.Status != "Pending")
                return BadRequest(ApiResponse<LeaveResponse>.ErrorResponse("Only pending leaves can be rejected"));

            var rejected = await _leaveRepository.RejectLeaveAsync(id, userId, request.RejectionReason);

            // Send notification to employee
            var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId);
            if (employee != null)
            {
                await _notificationRepository.CreateAsync(new Notification
                {
                    UserId = employee.UserId,
                    Title = "Leave Request Rejected",
                    Message = $"Your {leave.LeaveType} leave request from {leave.StartDate:MMM dd} to {leave.EndDate:MMM dd} has been rejected. Reason: {request.RejectionReason}",
                    Type = "error",
                    Link = $"/leaves/{id}"
                });
            }

            var empUser = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;
            var approver = await _userRepository.GetByIdAsync(userId);

            var response = new LeaveResponse
            {
                Id = rejected.Id,
                EmployeeId = rejected.EmployeeId,
                EmployeeName = empUser?.FullName ?? "Unknown",
                EmployeeCode = employee?.EmployeeCode ?? "",
                Department = employee?.Department?.Name ?? "N/A",
                LeaveType = rejected.LeaveType,
                StartDate = rejected.StartDate,
                EndDate = rejected.EndDate,
                DaysCount = rejected.DaysCount,
                Reason = rejected.Reason,
                Status = rejected.Status,
                ApprovedBy = rejected.ApprovedBy,
                ApprovedByName = approver?.FullName,
                ApprovedAt = rejected.ApprovedAt,
                RejectionReason = rejected.RejectionReason,
                CreatedAt = rejected.CreatedAt,
                UpdatedAt = rejected.UpdatedAt
            };

            return Ok(ApiResponse<LeaveResponse>.SuccessResponse(response, "Leave rejected successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting leave: {Id}", id);
            return StatusCode(500, ApiResponse<LeaveResponse>.ErrorResponse("Error rejecting leave"));
        }
    }

    /// <summary>
    /// Cancel a leave request (Employee can cancel own pending leave)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> CancelLeave(string id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var leave = await _leaveRepository.GetByIdAsync(id);

            if (leave == null)
                return NotFound(ApiResponse<bool>.ErrorResponse("Leave not found"));

            // Check if user owns this leave or is admin/manager
            var employee = await _employeeRepository.GetByIdAsync(leave.EmployeeId);
            var user = await _userRepository.GetByIdAsync(userId);

            if (employee?.UserId != userId && user?.Role != "Admin" && user?.Role != "Manager")
                return Forbid();

            if (leave.Status == "Approved")
            {
                // Restore leave balance if cancelling approved leave
                if (leave.LeaveType.ToLower() != "unpaid")
                {
                    var year = leave.StartDate.Year;
                    await _leaveBalanceRepository.RestoreLeaveAsync(leave.EmployeeId, year, leave.LeaveType, leave.DaysCount);
                }
            }

            var result = await _leaveRepository.DeleteAsync(id);

            return Ok(ApiResponse<bool>.SuccessResponse(result, "Leave cancelled successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling leave: {Id}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse("Error cancelling leave"));
        }
    }

    /// <summary>
    /// Get leave balance for an employee
    /// </summary>
    [HttpGet("balance/{employeeId}")]
    public async Task<ActionResult<ApiResponse<LeaveBalanceResponse>>> GetLeaveBalance(string employeeId, [FromQuery] int? year = null)
    {
        try
        {
            var currentYear = year ?? DateTime.UtcNow.Year;
            var balance = await _leaveBalanceRepository.GetByEmployeeAndYearAsync(employeeId, currentYear);

            if (balance == null)
            {
                // Create default balance for the year
                balance = new LeaveBalance
                {
                    EmployeeId = employeeId,
                    Year = currentYear
                };
                balance = await _leaveBalanceRepository.CreateAsync(balance);
            }

            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            var empUser = employee != null ? await _userRepository.GetByIdAsync(employee.UserId) : null;

            var response = new LeaveBalanceResponse
            {
                Id = balance.Id,
                EmployeeId = balance.EmployeeId,
                EmployeeName = empUser?.FullName ?? "Unknown",
                Year = balance.Year,
                SickLeaveTotal = balance.SickLeaveTotal,
                SickLeaveUsed = balance.SickLeaveUsed,
                SickLeaveRemaining = balance.SickLeaveRemaining,
                VacationLeaveTotal = balance.VacationLeaveTotal,
                VacationLeaveUsed = balance.VacationLeaveUsed,
                VacationLeaveRemaining = balance.VacationLeaveRemaining,
                PersonalLeaveTotal = balance.PersonalLeaveTotal,
                PersonalLeaveUsed = balance.PersonalLeaveUsed,
                PersonalLeaveRemaining = balance.PersonalLeaveRemaining,
                UnpaidLeaveUsed = balance.UnpaidLeaveUsed,
                CreatedAt = balance.CreatedAt,
                UpdatedAt = balance.UpdatedAt
            };

            return Ok(ApiResponse<LeaveBalanceResponse>.SuccessResponse(response, "Leave balance retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave balance for employee: {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<LeaveBalanceResponse>.ErrorResponse("Error retrieving leave balance"));
        }
    }
}
