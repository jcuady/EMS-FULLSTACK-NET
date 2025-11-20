using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("users")]
public class User : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("email")]
    public string Email { get; set; } = string.Empty;
    
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;
    
    [Column("role")]
    public string Role { get; set; } = string.Empty;
    
    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }
    
    [Column("password_hash")]
    public string? PasswordHash { get; set; }
    
    [Column("refresh_token")]
    public string? RefreshToken { get; set; }
    
    [Column("refresh_token_expiry")]
    public DateTime? RefreshTokenExpiry { get; set; }
    
    [Column("is_active")]
    public bool IsActive { get; set; } = true;
    
    [Column("last_login")]
    public DateTime? LastLogin { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
