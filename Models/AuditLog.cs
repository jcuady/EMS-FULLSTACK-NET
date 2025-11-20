using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("audit_logs")]
public class AuditLog : BaseModel
{
    [PrimaryKey("id", false)]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Column("user_name")]
    public string UserName { get; set; } = string.Empty;

    [Column("user_role")]
    public string UserRole { get; set; } = string.Empty;

    [Column("action")]
    public string Action { get; set; } = string.Empty; // Created, Updated, Deleted, Viewed, Approved, Rejected, etc.

    [Column("entity_type")]
    public string EntityType { get; set; } = string.Empty; // Employee, Attendance, Payroll, Leave, etc.

    [Column("entity_id")]
    public string? EntityId { get; set; }

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("changes")]
    public string? Changes { get; set; } // JSON string of changes

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
