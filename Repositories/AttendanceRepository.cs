using EmployeeMvp.Models;
using EmployeeMvp.Services;
using Supabase;

namespace EmployeeMvp.Repositories;

public interface IAttendanceRepository
{
    Task<List<Attendance>> GetAllAsync();
    Task<Attendance?> GetByIdAsync(string id);
    Task<List<Attendance>> GetByEmployeeIdAsync(string employeeId);
    Task<Attendance?> GetTodayAttendanceAsync(string employeeId);
    Task<Attendance> CreateAsync(Attendance attendance);
    Task<Attendance> UpdateAsync(Attendance attendance);
    Task<bool> DeleteAsync(string id);
}

public class AttendanceRepository : IAttendanceRepository
{
    private readonly Client _supabase;
    private readonly ISupabaseHttpClient _httpClient;
    private readonly ILogger<AttendanceRepository> _logger;

    public AttendanceRepository(Client supabase, ISupabaseHttpClient httpClient, ILogger<AttendanceRepository> logger)
    {
        _supabase = supabase;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<Attendance>> GetAllAsync()
    {
        try
        {
            var response = await _supabase
                .From<Attendance>()
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all attendance records");
            throw;
        }
    }

    public async Task<Attendance?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _supabase
                .From<Attendance>()
                .Where(a => a.Id == id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance by ID: {Id}", id);
            return null;
        }
    }

    public async Task<List<Attendance>> GetByEmployeeIdAsync(string employeeId)
    {
        try
        {
            var response = await _supabase
                .From<Attendance>()
                .Where(a => a.EmployeeId == employeeId)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance for employee: {EmployeeId}", employeeId);
            return new List<Attendance>();
        }
    }

    public async Task<Attendance?> GetTodayAttendanceAsync(string employeeId)
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var response = await _supabase
                .From<Attendance>()
                .Where(a => a.EmployeeId == employeeId && a.Date == today)
                .Get();

            return response.Models.FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching today's attendance for employee: {EmployeeId}", employeeId);
            return null;
        }
    }

    public async Task<Attendance> CreateAsync(Attendance attendance)
    {
        try
        {
            attendance.Id = Guid.NewGuid().ToString();
            attendance.CreatedAt = DateTime.UtcNow;
            attendance.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Creating attendance - EmployeeId: {EmployeeId}, Date: {Date}, ClockIn: {ClockIn}, ClockOut: {ClockOut}, Status: {Status}",
                attendance.EmployeeId, attendance.Date, attendance.ClockIn, attendance.ClockOut, attendance.Status);

            // Use HTTP client instead of Postgrest library for inserts
            // Convert DateTime to UTC and format as ISO 8601 string
            string? clockInStr = null;
            if (attendance.ClockIn.HasValue)
            {
                var clockInUtc = attendance.ClockIn.Value.Kind == DateTimeKind.Utc ? 
                    attendance.ClockIn.Value : 
                    attendance.ClockIn.Value.ToUniversalTime();
                clockInStr = clockInUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            }
            
            string? clockOutStr = null;
            if (attendance.ClockOut.HasValue)
            {
                var clockOutUtc = attendance.ClockOut.Value.Kind == DateTimeKind.Utc ? 
                    attendance.ClockOut.Value : 
                    attendance.ClockOut.Value.ToUniversalTime();
                clockOutStr = clockOutUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            }

            var result = await _httpClient.PostAsync<Attendance>("attendance", new
            {
                id = attendance.Id,
                employee_id = attendance.EmployeeId,
                date = attendance.Date.ToString("yyyy-MM-dd"),
                clock_in = clockInStr,
                clock_out = clockOutStr,
                status = attendance.Status,
                notes = attendance.Notes,
                approved_by = attendance.ApprovedBy
            });

            _logger.LogInformation("Attendance created successfully with ID: {Id}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating attendance record. EmployeeId: {EmployeeId}, Date: {Date}, Exception: {ExceptionType}, Message: {Message}", 
                attendance.EmployeeId, attendance.Date, ex.GetType().Name, ex.Message);
            throw;
        }
    }

    public async Task<Attendance> UpdateAsync(Attendance attendance)
    {
        try
        {
            attendance.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Updating attendance {Id} - ClockOut: {ClockOut}, Status: {Status}",
                attendance.Id, attendance.ClockOut, attendance.Status);

            // Use HTTP client instead of Postgrest for updates
            string? clockOutStr = null;
            if (attendance.ClockOut.HasValue)
            {
                var clockOutUtc = attendance.ClockOut.Value.Kind == DateTimeKind.Utc ? 
                    attendance.ClockOut.Value : 
                    attendance.ClockOut.Value.ToUniversalTime();
                clockOutStr = clockOutUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            }
            
            var result = await _httpClient.PatchAsync<Attendance>("attendance", attendance.Id, new
            {
                clock_out = clockOutStr,
                status = attendance.Status,
                notes = attendance.Notes,
                approved_by = attendance.ApprovedBy
            });

            _logger.LogInformation("Attendance updated successfully: {Id}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating attendance: {Id}", attendance.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            await _supabase
                .From<Attendance>()
                .Where(a => a.Id == id)
                .Delete();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attendance: {Id}", id);
            return false;
        }
    }
}
