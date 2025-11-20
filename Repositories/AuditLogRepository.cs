using EmployeeMvp.Config;
using EmployeeMvp.Models;
using EmployeeMvp.DTOs;
using Supabase;

namespace EmployeeMvp.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly Client _supabase;
    private readonly ILogger<AuditLogRepository> _logger;

    public AuditLogRepository(
        Client supabase,
        ILogger<AuditLogRepository> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<AuditLogPagedResponse> GetLogsAsync(AuditLogQuery query)
    {
        try
        {
            // Build query dynamically
            var allLogs = await _supabase
                .From<AuditLog>()
                .Get();

            var filteredLogs = allLogs.Models.AsEnumerable();

            if (!string.IsNullOrEmpty(query.UserId))
            {
                filteredLogs = filteredLogs.Where(l => l.UserId == query.UserId);
            }

            if (!string.IsNullOrEmpty(query.EntityType))
            {
                filteredLogs = filteredLogs.Where(l => l.EntityType == query.EntityType);
            }

            if (!string.IsNullOrEmpty(query.Action))
            {
                filteredLogs = filteredLogs.Where(l => l.Action == query.Action);
            }

            if (query.StartDate.HasValue)
            {
                filteredLogs = filteredLogs.Where(l => l.CreatedAt >= query.StartDate.Value);
            }

            if (query.EndDate.HasValue)
            {
                filteredLogs = filteredLogs.Where(l => l.CreatedAt <= query.EndDate.Value);
            }

            var total = filteredLogs.Count();
            var skip = (query.Page - 1) * query.PageSize;
            
            var logs = filteredLogs
                .OrderByDescending(l => l.CreatedAt)
                .Skip(skip)
                .Take(query.PageSize)
                .Select(l => new AuditLogResponse
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserName = l.UserName,
                    UserRole = l.UserRole,
                    Action = l.Action,
                    EntityType = l.EntityType,
                    EntityId = l.EntityId,
                    Description = l.Description,
                    IpAddress = l.IpAddress,
                    UserAgent = l.UserAgent,
                    Changes = l.Changes,
                    CreatedAt = l.CreatedAt
                })
                .ToList();

            return new AuditLogPagedResponse
            {
                Data = logs,
                TotalRecords = total,
                Page = query.Page,
                PageSize = query.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / query.PageSize)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            throw;
        }
    }

    public async Task<AuditLog?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _supabase
                .From<AuditLog>()
                .Filter("id", Postgrest.Constants.Operator.Equals, id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving audit log with ID {id}");
            return null;
        }
    }

    public async Task<AuditLog> CreateAsync(AuditLog auditLog)
    {
        try
        {
            var response = await _supabase
                .From<AuditLog>()
                .Insert(auditLog);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log");
            throw;
        }
    }

    public async Task<List<AuditLog>> GetByUserIdAsync(string userId, int limit = 100)
    {
        try
        {
            var response = await _supabase
                .From<AuditLog>()
                .Filter("user_id", Postgrest.Constants.Operator.Equals, userId)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Limit(limit)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving audit logs for user {userId}");
            return new List<AuditLog>();
        }
    }

    public async Task<List<AuditLog>> GetByEntityAsync(string entityType, string entityId, int limit = 50)
    {
        try
        {
            var response = await _supabase
                .From<AuditLog>()
                .Filter("entity_type", Postgrest.Constants.Operator.Equals, entityType)
                .Filter("entity_id", Postgrest.Constants.Operator.Equals, entityId)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Limit(limit)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving audit logs for entity {entityType}/{entityId}");
            return new List<AuditLog>();
        }
    }

    public async Task<List<AuditLog>> GetRecentAsync(int limit = 100)
    {
        try
        {
            var response = await _supabase
                .From<AuditLog>()
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Limit(limit)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent audit logs");
            return new List<AuditLog>();
        }
    }
}
