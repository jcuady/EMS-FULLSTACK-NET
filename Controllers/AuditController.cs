using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;

namespace EmployeeMvp.Controllers;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<AuditController> _logger;

    public AuditController(
        IAuditLogRepository auditLogRepository,
        ILogger<AuditController> logger)
    {
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get audit logs with filtering and pagination (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogQuery query)
    {
        try
        {
            var result = await _auditLogRepository.GetLogsAsync(query);
            return Ok(ApiResponse<AuditLogPagedResponse>.SuccessResponse(result, "Audit logs retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to retrieve audit logs"));
        }
    }

    /// <summary>
    /// Get a single audit log by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuditLogById(string id)
    {
        try
        {
            var auditLog = await _auditLogRepository.GetByIdAsync(id);

            if (auditLog == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Audit log not found"));
            }

            var response = new AuditLogResponse
            {
                Id = auditLog.Id,
                UserId = auditLog.UserId,
                UserName = auditLog.UserName,
                UserRole = auditLog.UserRole,
                Action = auditLog.Action,
                EntityType = auditLog.EntityType,
                EntityId = auditLog.EntityId,
                Description = auditLog.Description,
                IpAddress = auditLog.IpAddress,
                UserAgent = auditLog.UserAgent,
                Changes = auditLog.Changes,
                CreatedAt = auditLog.CreatedAt
            };

            return Ok(ApiResponse<AuditLogResponse>.SuccessResponse(response, "Audit log retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving audit log {id}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to retrieve audit log"));
        }
    }

    /// <summary>
    /// Get audit logs for a specific user (Admin only)
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetAuditLogsByUser(string userId, [FromQuery] int limit = 100)
    {
        try
        {
            var logs = await _auditLogRepository.GetByUserIdAsync(userId, limit);

            var response = logs.Select(l => new AuditLogResponse
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
            }).ToList();

            return Ok(ApiResponse<List<AuditLogResponse>>.SuccessResponse(response, $"Retrieved {response.Count} audit logs for user"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving audit logs for user {userId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to retrieve audit logs"));
        }
    }

    /// <summary>
    /// Get audit logs for a specific entity (Admin only)
    /// </summary>
    [HttpGet("entity/{entityType}/{entityId}")]
    public async Task<IActionResult> GetAuditLogsByEntity(string entityType, string entityId, [FromQuery] int limit = 50)
    {
        try
        {
            var logs = await _auditLogRepository.GetByEntityAsync(entityType, entityId, limit);

            var response = logs.Select(l => new AuditLogResponse
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
            }).ToList();

            return Ok(ApiResponse<List<AuditLogResponse>>.SuccessResponse(response, $"Retrieved {response.Count} audit logs for entity"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving audit logs for entity {entityType}/{entityId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to retrieve audit logs"));
        }
    }

    /// <summary>
    /// Get recent audit logs (Admin only)
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int limit = 100)
    {
        try
        {
            var logs = await _auditLogRepository.GetRecentAsync(limit);

            var response = logs.Select(l => new AuditLogResponse
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
            }).ToList();

            return Ok(ApiResponse<List<AuditLogResponse>>.SuccessResponse(response, $"Retrieved {response.Count} recent audit logs"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent audit logs");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to retrieve audit logs"));
        }
    }
}
