using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("leaves")]
public class Leave : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;

    [Column("employee_id")]
    public string EmployeeId { get; set; } = string.Empty;

    [Column("leave_type")]
    public string LeaveType { get; set; } = string.Empty; // Sick, Vacation, Personal, Unpaid

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("days_count")]
    public int DaysCount { get; set; }

    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled

    [Column("approved_by")]
    public string? ApprovedBy { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    [Column("employees")]
    public Employee? Employee { get; set; }

    [Column("approver")]
    public User? Approver { get; set; }
}
