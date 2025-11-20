using EmployeeMvp.Models;
using EmployeeMvp.Services;
using Supabase;

namespace EmployeeMvp.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly SupabaseClientFactory _supabaseFactory;
    private readonly ILogger<NotificationRepository> _logger;
    private Client _supabase = null!;

    public NotificationRepository(SupabaseClientFactory supabaseFactory, ILogger<NotificationRepository> logger)
    {
        _supabaseFactory = supabaseFactory;
        _logger = logger;
    }

    private async Task EnsureClientInitializedAsync()
    {
        _supabase ??= await _supabaseFactory.GetClientAsync();
    }

    public async Task<List<Notification>> GetAllByUserAsync(string userId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Notification>()
                .Where(n => n.UserId == userId)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<List<Notification>> GetUnreadByUserAsync(string userId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Notification>()
                .Where(n => n.UserId == userId && !n.IsRead)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread notifications for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Notification>()
                .Where(n => n.UserId == userId && !n.IsRead)
                .Get();

            return response.Models.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<Notification?> GetByIdAsync(string id)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Notification>()
                .Where(n => n.Id == id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification: {Id}", id);
            return null;
        }
    }

    public async Task<Notification> CreateAsync(Notification notification)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            notification.Id = Guid.NewGuid().ToString();
            notification.CreatedAt = DateTime.UtcNow;
            
            var response = await _supabase
                .From<Notification>()
                .Insert(notification);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating notification");
            throw;
        }
    }

    public async Task<Notification> MarkAsReadAsync(string id)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var notification = await GetByIdAsync(id);
            if (notification == null)
                throw new Exception("Notification not found");

            notification.IsRead = true;
            
            var response = await _supabase
                .From<Notification>()
                .Where(n => n.Id == id)
                .Update(notification);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read: {Id}", id);
            throw;
        }
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var notifications = await GetUnreadByUserAsync(userId);
            
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                await _supabase
                    .From<Notification>()
                    .Where(n => n.Id == notification.Id)
                    .Update(notification);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read for user: {UserId}", userId);
            throw;
        }
    }

    public async Task DeleteAsync(string id)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            await _supabase
                .From<Notification>()
                .Where(n => n.Id == id)
                .Delete();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification: {Id}", id);
            throw;
        }
    }

    public async Task DeleteAllReadAsync(string userId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var readNotifications = await _supabase
                .From<Notification>()
                .Where(n => n.UserId == userId && n.IsRead)
                .Get();

            foreach (var notification in readNotifications.Models)
            {
                await DeleteAsync(notification.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting read notifications for user: {UserId}", userId);
            throw;
        }
    }
}
