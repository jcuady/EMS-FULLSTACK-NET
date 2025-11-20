using EmployeeMvp.Models;

namespace EmployeeMvp.Repositories;

public interface INotificationRepository
{
    Task<List<Notification>> GetAllByUserAsync(string userId);
    Task<List<Notification>> GetUnreadByUserAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task<Notification?> GetByIdAsync(string id);
    Task<Notification> CreateAsync(Notification notification);
    Task<Notification> MarkAsReadAsync(string id);
    Task MarkAllAsReadAsync(string userId);
    Task DeleteAsync(string id);
    Task DeleteAllReadAsync(string userId);
}
