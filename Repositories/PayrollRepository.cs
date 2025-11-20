using EmployeeMvp.Models;
using EmployeeMvp.Services;
using Supabase;

namespace EmployeeMvp.Repositories;

public interface IPayrollRepository
{
    Task<List<Payroll>> GetAllAsync();
    Task<Payroll?> GetByIdAsync(string id);
    Task<List<Payroll>> GetByEmployeeIdAsync(string employeeId);
    Task<Payroll?> GetByEmployeeMonthYearAsync(string employeeId, int month, int year);
    Task<Payroll> CreateAsync(Payroll payroll);
    Task<Payroll> UpdateAsync(Payroll payroll);
    Task<bool> DeleteAsync(string id);
}

public class PayrollRepository : IPayrollRepository
{
    private readonly Client _supabase;
    private readonly ISupabaseHttpClient _httpClient;
    private readonly ILogger<PayrollRepository> _logger;

    public PayrollRepository(Client supabase, ISupabaseHttpClient httpClient, ILogger<PayrollRepository> logger)
    {
        _supabase = supabase;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<Payroll>> GetAllAsync()
    {
        try
        {
            var response = await _supabase
                .From<Payroll>()
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all payroll records");
            throw;
        }
    }

    public async Task<Payroll?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _supabase
                .From<Payroll>()
                .Where(p => p.Id == id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll by ID: {Id}", id);
            return null;
        }
    }

    public async Task<List<Payroll>> GetByEmployeeIdAsync(string employeeId)
    {
        try
        {
            var response = await _supabase
                .From<Payroll>()
                .Where(p => p.EmployeeId == employeeId)
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll for employee: {EmployeeId}", employeeId);
            return new List<Payroll>();
        }
    }

    public async Task<Payroll?> GetByEmployeeMonthYearAsync(string employeeId, int month, int year)
    {
        try
        {
            var response = await _supabase
                .From<Payroll>()
                .Where(p => p.EmployeeId == employeeId)
                .Where(p => p.Month == month)
                .Where(p => p.Year == year)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll for employee: {EmployeeId}, Month: {Month}, Year: {Year}", 
                employeeId, month, year);
            return null;
        }
    }

    public async Task<Payroll> CreateAsync(Payroll payroll)
    {
        try
        {
            payroll.Id = Guid.NewGuid().ToString();
            payroll.CreatedAt = DateTime.UtcNow;
            payroll.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Creating payroll - EmployeeId: {EmployeeId}, Month: {Month}, Year: {Year}, BasicSalary: {BasicSalary}, NetSalary: {NetSalary}",
                payroll.EmployeeId, payroll.Month, payroll.Year, payroll.BasicSalary, payroll.NetSalary);

            // Use HTTP client instead of Postgrest library for inserts
            var result = await _httpClient.PostAsync<Payroll>("payroll", new
            {
                id = payroll.Id,
                employee_id = payroll.EmployeeId,
                month = payroll.Month,
                year = payroll.Year,
                basic_salary = payroll.BasicSalary,
                allowances = payroll.Allowances,
                bonuses = payroll.Bonuses,
                deductions = payroll.Deductions,
                tax = payroll.Tax,
                net_salary = payroll.NetSalary,
                payment_date = payroll.PaymentDate?.ToString("yyyy-MM-dd"),
                payment_status = payroll.PaymentStatus,
                payment_method = payroll.PaymentMethod,
                notes = payroll.Notes,
                processed_by = payroll.ProcessedBy
            });

            _logger.LogInformation("Payroll created successfully with ID: {Id}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payroll. EmployeeId: {EmployeeId}, Month: {Month}, Year: {Year}, Exception: {ExceptionType}, Message: {Message}", 
                payroll.EmployeeId, payroll.Month, payroll.Year, ex.GetType().Name, ex.Message);
            throw;
        }
    }

    public async Task<Payroll> UpdateAsync(Payroll payroll)
    {
        try
        {
            payroll.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Updating payroll {Id} - NetSalary: {NetSalary}, Status: {Status}",
                payroll.Id, payroll.NetSalary, payroll.PaymentStatus);

            // Use HTTP client instead of Postgrest for updates
            var result = await _httpClient.PatchAsync<Payroll>("payroll", payroll.Id, new
            {
                basic_salary = payroll.BasicSalary,
                allowances = payroll.Allowances,
                bonuses = payroll.Bonuses,
                deductions = payroll.Deductions,
                tax = payroll.Tax,
                net_salary = payroll.NetSalary,
                payment_date = payroll.PaymentDate?.ToString("yyyy-MM-dd"),
                payment_status = payroll.PaymentStatus,
                payment_method = payroll.PaymentMethod,
                notes = payroll.Notes,
                processed_by = payroll.ProcessedBy
            });

            _logger.LogInformation("Payroll updated successfully: {Id}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payroll: {Id}", payroll.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            await _supabase
                .From<Payroll>()
                .Where(p => p.Id == id)
                .Delete();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting payroll: {Id}", id);
            return false;
        }
    }
}
