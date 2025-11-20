using System.ComponentModel.DataAnnotations;

namespace EmployeeMvp.DTOs;

// Create Employee Request
public class CreateEmployeeRequest
{
    [Required(ErrorMessage = "User ID is required")]
    public string UserId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Employee code is required")]
    [StringLength(20, ErrorMessage = "Employee code cannot exceed 20 characters")]
    public string EmployeeCode { get; set; } = string.Empty;

    public string? DepartmentId { get; set; }

    [Required(ErrorMessage = "Position is required")]
    [StringLength(100, ErrorMessage = "Position cannot exceed 100 characters")]
    public string Position { get; set; } = string.Empty;

    [Required(ErrorMessage = "Employment type is required")]
    public string EmploymentType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hire date is required")]
    public DateTime HireDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Salary must be positive")]
    public decimal? Salary { get; set; }

    [Phone(ErrorMessage = "Invalid phone number")]
    public string? Phone { get; set; }

    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }

    [Range(0, 5, ErrorMessage = "Performance rating must be between 0 and 5")]
    public decimal? PerformanceRating { get; set; }
}

// Update Employee Request
public class UpdateEmployeeRequest
{
    public string? DepartmentId { get; set; }

    [StringLength(100, ErrorMessage = "Position cannot exceed 100 characters")]
    public string? Position { get; set; }

    public string? EmploymentType { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Salary must be positive")]
    public decimal? Salary { get; set; }

    [Phone(ErrorMessage = "Invalid phone number")]
    public string? Phone { get; set; }

    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }

    [Range(0, 5, ErrorMessage = "Performance rating must be between 0 and 5")]
    public decimal? PerformanceRating { get; set; }
}

// Employee Response
public class EmployeeResponse
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string Position { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public decimal? Salary { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? PerformanceRating { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
