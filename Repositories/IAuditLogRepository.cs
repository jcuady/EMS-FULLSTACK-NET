using EmployeeMvp.Models;
using EmployeeMvp.DTOs;

namespace EmployeeMvp.Repositories;

public interface IAuditLogRepository
{
    Task<AuditLogPagedResponse> GetLogsAsync(AuditLogQuery query);
    Task<AuditLog?> GetByIdAsync(string id);
    Task<AuditLog> CreateAsync(AuditLog auditLog);
    Task<List<AuditLog>> GetByUserIdAsync(string userId, int limit = 100);
    Task<List<AuditLog>> GetByEntityAsync(string entityType, string entityId, int limit = 50);
    Task<List<AuditLog>> GetRecentAsync(int limit = 100);
}
