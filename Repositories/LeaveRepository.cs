using EmployeeMvp.Models;
using EmployeeMvp.Services;
using Supabase;

namespace EmployeeMvp.Repositories;

public class LeaveRepository : ILeaveRepository
{
    private readonly SupabaseClientFactory _supabaseFactory;
    private readonly ILogger<LeaveRepository> _logger;
    private Client _supabase = null!;

    public LeaveRepository(SupabaseClientFactory supabaseFactory, ILogger<LeaveRepository> logger)
    {
        _supabaseFactory = supabaseFactory;
        _logger = logger;
    }

    private async Task EnsureClientInitializedAsync()
    {
        _supabase ??= await _supabaseFactory.GetClientAsync();
    }

    public async Task<List<Leave>> GetAllAsync()
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Leave>()
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all leaves");
            throw;
        }
    }

    public async Task<Leave?> GetByIdAsync(string id)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Leave>()
                .Where(l => l.Id == id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leave: {Id}", id);
            return null;
        }
    }

    public async Task<List<Leave>> GetByEmployeeAsync(string employeeId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Leave>()
                .Where(l => l.EmployeeId == employeeId)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leaves for employee: {EmployeeId}", employeeId);
            throw;
        }
    }

    public async Task<List<Leave>> GetByStatusAsync(string status)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<Leave>()
                .Where(l => l.Status == status)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leaves by status: {Status}", status);
            throw;
        }
    }

    public async Task<List<Leave>> GetPendingByManagerAsync(string managerId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            // Get all pending leaves - in a real app, filter by manager's department
            var response = await _supabase
                .From<Leave>()
                .Where(l => l.Status == "Pending")
                .Order("created_at", Postgrest.Constants.Ordering.Ascending)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending leaves for manager: {ManagerId}", managerId);
            throw;
        }
    }

    public async Task<Leave> CreateAsync(Leave leave)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            leave.Id = Guid.NewGuid().ToString();
            leave.CreatedAt = DateTime.UtcNow;
            leave.UpdatedAt = DateTime.UtcNow;
            leave.Status = "Pending";

            var response = await _supabase
                .From<Leave>()
                .Insert(leave);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave");
            throw;
        }
    }

    public async Task<Leave> UpdateAsync(Leave leave)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            leave.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<Leave>()
                .Where(l => l.Id == leave.Id)
                .Update(leave);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating leave: {Id}", leave.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            await _supabase
                .From<Leave>()
                .Where(l => l.Id == id)
                .Delete();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting leave: {Id}", id);
            return false;
        }
    }

    public async Task<Leave> ApproveLeaveAsync(string id, string approverId)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var leave = await GetByIdAsync(id);
            if (leave == null)
                throw new Exception("Leave not found");

            leave.Status = "Approved";
            leave.ApprovedBy = approverId;
            leave.ApprovedAt = DateTime.UtcNow;
            leave.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<Leave>()
                .Where(l => l.Id == id)
                .Update(leave);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving leave: {Id}", id);
            throw;
        }
    }

    public async Task<Leave> RejectLeaveAsync(string id, string approverId, string reason)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var leave = await GetByIdAsync(id);
            if (leave == null)
                throw new Exception("Leave not found");

            leave.Status = "Rejected";
            leave.ApprovedBy = approverId;
            leave.ApprovedAt = DateTime.UtcNow;
            leave.RejectionReason = reason;
            leave.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<Leave>()
                .Where(l => l.Id == id)
                .Update(leave);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting leave: {Id}", id);
            throw;
        }
    }

    public async Task<bool> HasOverlappingLeaveAsync(string employeeId, DateTime startDate, DateTime endDate, string? excludeLeaveId = null)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var leaves = await GetByEmployeeAsync(employeeId);
            
            // Filter only approved or pending leaves
            var activeLeaves = leaves.Where(l => 
                l.Status == "Approved" || l.Status == "Pending");

            // Exclude current leave if updating
            if (!string.IsNullOrEmpty(excludeLeaveId))
            {
                activeLeaves = activeLeaves.Where(l => l.Id != excludeLeaveId);
            }

            // Check for overlaps
            return activeLeaves.Any(l =>
                (startDate >= l.StartDate && startDate <= l.EndDate) ||
                (endDate >= l.StartDate && endDate <= l.EndDate) ||
                (startDate <= l.StartDate && endDate >= l.EndDate));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking overlapping leaves");
            throw;
        }
    }
}
