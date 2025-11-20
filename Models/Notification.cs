using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("notifications")]
public class Notification : BaseModel
{
    [PrimaryKey("id", false)]
    [Column("id")]
    public string Id { get; set; } = string.Empty;

    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("type")]
    public string Type { get; set; } = "info"; // info, success, warning, error

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("link")]
    public string? Link { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [Column("users")]
    public User? User { get; set; }
}
