using System.ComponentModel.DataAnnotations;

namespace EmployeeMvp.DTOs;

public class NotificationDTO
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public bool IsRead { get; set; } = false;
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationRequest
{
    [Required(ErrorMessage = "User ID is required")]
    public string UserId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Message is required")]
    [StringLength(1000, ErrorMessage = "Message cannot exceed 1000 characters")]
    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = "info";
    public string? Link { get; set; }
}

public class MarkAsReadRequest
{
    [Required]
    public string NotificationId { get; set; } = string.Empty;
}
