using System.ComponentModel.DataAnnotations;

namespace EmployeeMvp.DTOs;

// Clock In Request
public class ClockInRequest
{
    [Required(ErrorMessage = "Employee ID is required")]
    public string EmployeeId { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

// Clock Out Request
public class ClockOutRequest
{
    [Required(ErrorMessage = "Attendance ID is required")]
    public string AttendanceId { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

// Create Attendance Request (for admins)
public class CreateAttendanceRequest
{
    [Required(ErrorMessage = "Employee ID is required")]
    public string EmployeeId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date is required")]
    public DateTime Date { get; set; }

    public DateTime? ClockIn { get; set; }
    public DateTime? ClockOut { get; set; }

    [Required(ErrorMessage = "Status is required")]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

// Attendance Response
public class AttendanceResponse
{
    public string Id { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? ClockIn { get; set; }
    public DateTime? ClockOut { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? WorkingHours { get; set; }
    public DateTime CreatedAt { get; set; }
}
