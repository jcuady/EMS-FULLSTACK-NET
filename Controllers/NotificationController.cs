using EmployeeMvp.DTOs;
using EmployeeMvp.Models;
using EmployeeMvp.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeMvp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(INotificationRepository notificationRepository, ILogger<NotificationController> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
    }

    /// <summary>
    /// Get all notifications for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<NotificationDTO>>> GetAll()
    {
        try
        {
            var userId = GetCurrentUserId();
            var notifications = await _notificationRepository.GetAllByUserAsync(userId);
            
            var notificationDTOs = notifications.Select(n => new NotificationDTO
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                Link = n.Link,
                CreatedAt = n.CreatedAt
            }).ToList();

            return Ok(notificationDTOs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications");
            return StatusCode(500, new { message = "Error retrieving notifications" });
        }
    }

    /// <summary>
    /// Get unread notifications for the current user
    /// </summary>
    [HttpGet("unread")]
    public async Task<ActionResult<List<NotificationDTO>>> GetUnread()
    {
        try
        {
            var userId = GetCurrentUserId();
            var notifications = await _notificationRepository.GetUnreadByUserAsync(userId);
            
            var notificationDTOs = notifications.Select(n => new NotificationDTO
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                Link = n.Link,
                CreatedAt = n.CreatedAt
            }).ToList();

            return Ok(notificationDTOs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread notifications");
            return StatusCode(500, new { message = "Error retrieving unread notifications" });
        }
    }

    /// <summary>
    /// Get unread notification count for the current user
    /// </summary>
    [HttpGet("unread/count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        try
        {
            var userId = GetCurrentUserId();
            var count = await _notificationRepository.GetUnreadCountAsync(userId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
            return StatusCode(500, new { message = "Error retrieving unread count" });
        }
    }

    /// <summary>
    /// Create a new notification (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NotificationDTO>> Create([FromBody] CreateNotificationRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var notification = new Notification
            {
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type ?? "info",
                Link = request.Link,
                IsRead = false
            };

            var created = await _notificationRepository.CreateAsync(notification);

            var notificationDTO = new NotificationDTO
            {
                Id = created.Id,
                UserId = created.UserId,
                Title = created.Title,
                Message = created.Message,
                Type = created.Type,
                IsRead = created.IsRead,
                Link = created.Link,
                CreatedAt = created.CreatedAt
            };

            return CreatedAtAction(nameof(GetAll), new { id = created.Id }, notificationDTO);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating notification");
            return StatusCode(500, new { message = "Error creating notification" });
        }
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPost("{id}/read")]
    public async Task<ActionResult<NotificationDTO>> MarkAsRead(string id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var notification = await _notificationRepository.GetByIdAsync(id);

            if (notification == null)
                return NotFound(new { message = "Notification not found" });

            // Ensure user owns the notification
            if (notification.UserId != userId)
                return Forbid();

            var updated = await _notificationRepository.MarkAsReadAsync(id);

            var notificationDTO = new NotificationDTO
            {
                Id = updated.Id,
                UserId = updated.UserId,
                Title = updated.Title,
                Message = updated.Message,
                Type = updated.Type,
                IsRead = updated.IsRead,
                Link = updated.Link,
                CreatedAt = updated.CreatedAt
            };

            return Ok(notificationDTO);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read");
            return StatusCode(500, new { message = "Error marking notification as read" });
        }
    }

    /// <summary>
    /// Mark all notifications as read for the current user
    /// </summary>
    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        try
        {
            var userId = GetCurrentUserId();
            await _notificationRepository.MarkAllAsReadAsync(userId);
            return Ok(new { message = "All notifications marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read");
            return StatusCode(500, new { message = "Error marking all notifications as read" });
        }
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var notification = await _notificationRepository.GetByIdAsync(id);

            if (notification == null)
                return NotFound(new { message = "Notification not found" });

            // Ensure user owns the notification
            if (notification.UserId != userId)
                return Forbid();

            await _notificationRepository.DeleteAsync(id);
            return Ok(new { message = "Notification deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification");
            return StatusCode(500, new { message = "Error deleting notification" });
        }
    }

    /// <summary>
    /// Delete all read notifications for the current user
    /// </summary>
    [HttpDelete("clear-read")]
    public async Task<ActionResult> ClearRead()
    {
        try
        {
            var userId = GetCurrentUserId();
            await _notificationRepository.DeleteAllReadAsync(userId);
            return Ok(new { message = "Read notifications cleared" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing read notifications");
            return StatusCode(500, new { message = "Error clearing read notifications" });
        }
    }
}
