using System.ComponentModel.DataAnnotations;

namespace EmployeeMvp.DTOs;

// Create Payroll Request
public class CreatePayrollRequest
{
    [Required(ErrorMessage = "Employee ID is required")]
    public string EmployeeId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Month is required")]
    [Range(1, 12, ErrorMessage = "Month must be between 1 and 12")]
    public int Month { get; set; }

    [Required(ErrorMessage = "Year is required")]
    [Range(2020, 2100, ErrorMessage = "Invalid year")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Basic salary is required")]
    [Range(0, double.MaxValue, ErrorMessage = "Basic salary must be positive")]
    public decimal BasicSalary { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Allowances must be positive")]
    public decimal Allowances { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Bonuses must be positive")]
    public decimal Bonuses { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Deductions must be positive")]
    public decimal Deductions { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Tax must be positive")]
    public decimal Tax { get; set; }

    public DateTime? PaymentDate { get; set; }
    
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Processed, Paid
    
    public string? PaymentMethod { get; set; }
    
    public string? ProcessedBy { get; set; }

    public string? Notes { get; set; }
}

// Payroll Response
public class PayrollResponse
{
    public string Id { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Bonuses { get; set; }
    public decimal Deductions { get; set; }
    public decimal Tax { get; set; }
    public decimal NetSalary { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? ProcessedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
