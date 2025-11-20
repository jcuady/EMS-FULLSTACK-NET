using System.ComponentModel.DataAnnotations;

namespace EmployeeMvp.DTOs;

public class ReportRequest
{
    [Required]
    public string ReportType { get; set; } = string.Empty; // Employees, Attendance, Payroll, Leaves

    [Required]
    public string ExportFormat { get; set; } = string.Empty; // PDF, Excel

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? EmployeeId { get; set; }

    public string? Department { get; set; }

    public string? Status { get; set; }
}

public class EmployeeReportData
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal BaseSalary { get; set; }
}

public class AttendanceReportData
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? ClockIn { get; set; }
    public TimeSpan? ClockOut { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal WorkHours { get; set; }
}

public class PayrollReportData
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public decimal BaseSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    public DateTime PayrollDate { get; set; }
    public string PayrollPeriod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class LeaveReportData
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ReportMetadata
{
    public string ReportType { get; set; } = string.Empty;
    public string ExportFormat { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? FilterCriteria { get; set; }
}
