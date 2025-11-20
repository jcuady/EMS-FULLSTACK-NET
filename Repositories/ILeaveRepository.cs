using EmployeeMvp.Models;

namespace EmployeeMvp.Repositories;

public interface ILeaveRepository
{
    Task<List<Leave>> GetAllAsync();
    Task<Leave?> GetByIdAsync(string id);
    Task<List<Leave>> GetByEmployeeAsync(string employeeId);
    Task<List<Leave>> GetByStatusAsync(string status);
    Task<List<Leave>> GetPendingByManagerAsync(string managerId);
    Task<Leave> CreateAsync(Leave leave);
    Task<Leave> UpdateAsync(Leave leave);
    Task<bool> DeleteAsync(string id);
    Task<Leave> ApproveLeaveAsync(string id, string approverId);
    Task<Leave> RejectLeaveAsync(string id, string approverId, string reason);
    Task<bool> HasOverlappingLeaveAsync(string employeeId, DateTime startDate, DateTime endDate, string? excludeLeaveId = null);
}

public interface ILeaveBalanceRepository
{
    Task<LeaveBalance?> GetByEmployeeAndYearAsync(string employeeId, int year);
    Task<LeaveBalance> CreateAsync(LeaveBalance leaveBalance);
    Task<LeaveBalance> UpdateAsync(LeaveBalance leaveBalance);
    Task<bool> DeductLeaveAsync(string employeeId, int year, string leaveType, int days);
    Task<bool> RestoreLeaveAsync(string employeeId, int year, string leaveType, int days);
    Task<bool> HasSufficientBalanceAsync(string employeeId, int year, string leaveType, int days);
}
