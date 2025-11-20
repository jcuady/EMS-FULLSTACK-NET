using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("attendance")]
public class Attendance : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("employee_id")]
    public string EmployeeId { get; set; } = string.Empty;
    
    [Column("date")]
    public DateTime Date { get; set; }
    
    [Column("clock_in")]
    public DateTime? ClockIn { get; set; }
    
    [Column("clock_out")]
    public DateTime? ClockOut { get; set; }
    
    [Column("status")]
    public string Status { get; set; } = string.Empty;
    
    [Column("notes")]
    public string? Notes { get; set; }
    
    [Column("approved_by")]
    public string? ApprovedBy { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public Employee? Employee { get; set; }
}
