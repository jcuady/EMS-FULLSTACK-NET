using EmployeeMvp.Models;
using EmployeeMvp.Repositories;
using System.Text.Json;

namespace EmployeeMvp.Services;

public interface IAuditService
{
    Task LogActionAsync(
        string userId,
        string userName,
        string userRole,
        string action,
        string entityType,
        string? entityId,
        string description,
        object? changes = null,
        string? ipAddress = null,
        string? userAgent = null);
}

public class AuditService : IAuditService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IAuditLogRepository auditLogRepository,
        ILogger<AuditService> logger)
    {
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    public async Task LogActionAsync(
        string userId,
        string userName,
        string userRole,
        string action,
        string entityType,
        string? entityId,
        string description,
        object? changes = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                UserName = userName,
                UserRole = userRole,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Description = description,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Changes = changes != null ? JsonSerializer.Serialize(changes) : null,
                CreatedAt = DateTime.UtcNow
            };

            await _auditLogRepository.CreateAsync(auditLog);
            _logger.LogInformation(
                "Audit log created: {UserName} ({UserRole}) performed {Action} on {EntityType} ({EntityId})",
                userName, userRole, action, entityType, entityId ?? "N/A");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log");
            // Don't throw - audit logging should not break the main flow
        }
    }
}
