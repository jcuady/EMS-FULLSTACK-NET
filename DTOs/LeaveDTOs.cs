using System.ComponentModel.DataAnnotations;

namespace EmployeeMvp.DTOs;

/// <summary>
/// Response DTO for leave data
/// </summary>
public class LeaveResponse
{
    public string Id { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysCount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Request DTO for creating a leave
/// </summary>
public class CreateLeaveRequest
{
    [Required(ErrorMessage = "Employee ID is required")]
    public string EmployeeId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Leave type is required")]
    [RegularExpression("^(Sick|Vacation|Personal|Unpaid)$", ErrorMessage = "Invalid leave type. Must be: Sick, Vacation, Personal, or Unpaid")]
    public string LeaveType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Start date is required")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End date is required")]
    public DateTime EndDate { get; set; }

    [Required(ErrorMessage = "Reason is required")]
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Reason must be between 10 and 500 characters")]
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for approving a leave
/// </summary>
public class ApproveLeaveRequest
{
    [Required(ErrorMessage = "Leave ID is required")]
    public string LeaveId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Approver ID is required")]
    public string ApproverId { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for rejecting a leave
/// </summary>
public class RejectLeaveRequest
{
    [Required(ErrorMessage = "Leave ID is required")]
    public string LeaveId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Approver ID is required")]
    public string ApproverId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Rejection reason is required")]
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Rejection reason must be between 10 and 500 characters")]
    public string RejectionReason { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for leave balance
/// </summary>
public class LeaveBalanceResponse
{
    public string Id { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int Year { get; set; }
    
    public int SickLeaveTotal { get; set; }
    public int SickLeaveUsed { get; set; }
    public int SickLeaveRemaining { get; set; }
    
    public int VacationLeaveTotal { get; set; }
    public int VacationLeaveUsed { get; set; }
    public int VacationLeaveRemaining { get; set; }
    
    public int PersonalLeaveTotal { get; set; }
    public int PersonalLeaveUsed { get; set; }
    public int PersonalLeaveRemaining { get; set; }
    
    public int UnpaidLeaveUsed { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Request DTO for updating leave balance
/// </summary>
public class UpdateLeaveBalanceRequest
{
    [Required(ErrorMessage = "Employee ID is required")]
    public string EmployeeId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Year is required")]
    [Range(2020, 2100, ErrorMessage = "Year must be between 2020 and 2100")]
    public int Year { get; set; }

    [Range(0, 365, ErrorMessage = "Sick leave total must be between 0 and 365")]
    public int? SickLeaveTotal { get; set; }

    [Range(0, 365, ErrorMessage = "Vacation leave total must be between 0 and 365")]
    public int? VacationLeaveTotal { get; set; }

    [Range(0, 365, ErrorMessage = "Personal leave total must be between 0 and 365")]
    public int? PersonalLeaveTotal { get; set; }
}
