using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("employees")]
public class Employee : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;
    
    [Column("employee_code")]
    public string EmployeeCode { get; set; } = string.Empty;
    
    [Column("department_id")]
    public string? DepartmentId { get; set; }
    
    [Column("position")]
    public string Position { get; set; } = string.Empty;
    
    [Column("employment_type")]
    public string EmploymentType { get; set; } = string.Empty;
    
    [Column("hire_date")]
    public DateTime HireDate { get; set; }
    
    [Column("salary")]
    public decimal? Salary { get; set; }
    
    [Column("phone")]
    public string? Phone { get; set; }
    
    [Column("address")]
    public string? Address { get; set; }
    
    [Column("emergency_contact")]
    public string? EmergencyContact { get; set; }
    
    [Column("emergency_phone")]
    public string? EmergencyPhone { get; set; }
    
    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }
    
    [Column("gender")]
    public string? Gender { get; set; }
    
    [Column("performance_rating")]
    public decimal? PerformanceRating { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties (not stored in DB, loaded separately)
    public User? User { get; set; }
    public Department? Department { get; set; }
}
