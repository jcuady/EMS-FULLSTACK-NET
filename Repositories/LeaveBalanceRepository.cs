using EmployeeMvp.Models;
using EmployeeMvp.Services;
using Supabase;

namespace EmployeeMvp.Repositories;

public class LeaveBalanceRepository : ILeaveBalanceRepository
{
    private readonly SupabaseClientFactory _supabaseFactory;
    private readonly ILogger<LeaveBalanceRepository> _logger;
    private Client _supabase = null!;

    public LeaveBalanceRepository(SupabaseClientFactory supabaseFactory, ILogger<LeaveBalanceRepository> logger)
    {
        _supabaseFactory = supabaseFactory;
        _logger = logger;
    }

    private async Task EnsureClientInitializedAsync()
    {
        _supabase ??= await _supabaseFactory.GetClientAsync();
    }

    public async Task<LeaveBalance?> GetByEmployeeAndYearAsync(string employeeId, int year)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var response = await _supabase
                .From<LeaveBalance>()
                .Where(lb => lb.EmployeeId == employeeId && lb.Year == year)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leave balance for employee: {EmployeeId}, year: {Year}", employeeId, year);
            return null;
        }
    }

    public async Task<LeaveBalance> CreateAsync(LeaveBalance leaveBalance)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            leaveBalance.Id = Guid.NewGuid().ToString();
            leaveBalance.CreatedAt = DateTime.UtcNow;
            leaveBalance.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<LeaveBalance>()
                .Insert(leaveBalance);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave balance");
            throw;
        }
    }

    public async Task<LeaveBalance> UpdateAsync(LeaveBalance leaveBalance)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            leaveBalance.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<LeaveBalance>()
                .Where(lb => lb.Id == leaveBalance.Id)
                .Update(leaveBalance);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating leave balance: {Id}", leaveBalance.Id);
            throw;
        }
    }

    public async Task<bool> DeductLeaveAsync(string employeeId, int year, string leaveType, int days)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var balance = await GetByEmployeeAndYearAsync(employeeId, year);
            if (balance == null)
                return false;

            switch (leaveType.ToLower())
            {
                case "sick":
                    balance.SickLeaveUsed += days;
                    balance.SickLeaveRemaining = balance.SickLeaveTotal - balance.SickLeaveUsed;
                    break;
                case "vacation":
                    balance.VacationLeaveUsed += days;
                    balance.VacationLeaveRemaining = balance.VacationLeaveTotal - balance.VacationLeaveUsed;
                    break;
                case "personal":
                    balance.PersonalLeaveUsed += days;
                    balance.PersonalLeaveRemaining = balance.PersonalLeaveTotal - balance.PersonalLeaveUsed;
                    break;
                case "unpaid":
                    balance.UnpaidLeaveUsed += days;
                    break;
                default:
                    return false;
            }

            await UpdateAsync(balance);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deducting leave");
            return false;
        }
    }

    public async Task<bool> RestoreLeaveAsync(string employeeId, int year, string leaveType, int days)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var balance = await GetByEmployeeAndYearAsync(employeeId, year);
            if (balance == null)
                return false;

            switch (leaveType.ToLower())
            {
                case "sick":
                    balance.SickLeaveUsed = Math.Max(0, balance.SickLeaveUsed - days);
                    balance.SickLeaveRemaining = balance.SickLeaveTotal - balance.SickLeaveUsed;
                    break;
                case "vacation":
                    balance.VacationLeaveUsed = Math.Max(0, balance.VacationLeaveUsed - days);
                    balance.VacationLeaveRemaining = balance.VacationLeaveTotal - balance.VacationLeaveUsed;
                    break;
                case "personal":
                    balance.PersonalLeaveUsed = Math.Max(0, balance.PersonalLeaveUsed - days);
                    balance.PersonalLeaveRemaining = balance.PersonalLeaveTotal - balance.PersonalLeaveUsed;
                    break;
                case "unpaid":
                    balance.UnpaidLeaveUsed = Math.Max(0, balance.UnpaidLeaveUsed - days);
                    break;
                default:
                    return false;
            }

            await UpdateAsync(balance);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring leave");
            return false;
        }
    }

    public async Task<bool> HasSufficientBalanceAsync(string employeeId, int year, string leaveType, int days)
    {
        await EnsureClientInitializedAsync();
        
        try
        {
            var balance = await GetByEmployeeAndYearAsync(employeeId, year);
            if (balance == null)
                return false;

            return leaveType.ToLower() switch
            {
                "sick" => balance.SickLeaveRemaining >= days,
                "vacation" => balance.VacationLeaveRemaining >= days,
                "personal" => balance.PersonalLeaveRemaining >= days,
                "unpaid" => true, // Unpaid leave always allowed
                _ => false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking leave balance");
            return false;
        }
    }
}
