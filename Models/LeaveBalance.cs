using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("leave_balances")]
public class LeaveBalance : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;

    [Column("employee_id")]
    public string EmployeeId { get; set; } = string.Empty;

    [Column("year")]
    public int Year { get; set; }

    [Column("sick_leave_total")]
    public int SickLeaveTotal { get; set; } = 10;

    [Column("sick_leave_used")]
    public int SickLeaveUsed { get; set; } = 0;

    [Column("sick_leave_remaining")]
    public int SickLeaveRemaining { get; set; } = 10;

    [Column("vacation_leave_total")]
    public int VacationLeaveTotal { get; set; } = 15;

    [Column("vacation_leave_used")]
    public int VacationLeaveUsed { get; set; } = 0;

    [Column("vacation_leave_remaining")]
    public int VacationLeaveRemaining { get; set; } = 15;

    [Column("personal_leave_total")]
    public int PersonalLeaveTotal { get; set; } = 5;

    [Column("personal_leave_used")]
    public int PersonalLeaveUsed { get; set; } = 0;

    [Column("personal_leave_remaining")]
    public int PersonalLeaveRemaining { get; set; } = 5;

    [Column("unpaid_leave_used")]
    public int UnpaidLeaveUsed { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    [Column("employees")]
    public Employee? Employee { get; set; }
}
