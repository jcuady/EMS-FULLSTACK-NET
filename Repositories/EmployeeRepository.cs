using EmployeeMvp.Models;
using Supabase;

namespace EmployeeMvp.Repositories;

public interface IEmployeeRepository
{
    Task<List<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(string id);
    Task<Employee?> GetByUserIdAsync(string userId);
    Task<Employee> CreateAsync(Employee employee);
    Task<Employee> UpdateAsync(Employee employee);
    Task<bool> DeleteAsync(string id);
    Task<bool> ExistsAsync(string employeeCode);
}

public class EmployeeRepository : IEmployeeRepository
{
    private readonly Client _supabase;
    private readonly ILogger<EmployeeRepository> _logger;

    public EmployeeRepository(Client supabase, ILogger<EmployeeRepository> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<List<Employee>> GetAllAsync()
    {
        try
        {
            var response = await _supabase
                .From<Employee>()
                .Get();

            return response.Models;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all employees");
            throw;
        }
    }

    public async Task<Employee?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _supabase
                .From<Employee>()
                .Where(e => e.Id == id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee by ID: {Id}", id);
            return null;
        }
    }

    public async Task<Employee?> GetByUserIdAsync(string userId)
    {
        try
        {
            var response = await _supabase
                .From<Employee>()
                .Where(e => e.UserId == userId)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee by user ID: {UserId}", userId);
            return null;
        }
    }

    public async Task<Employee> CreateAsync(Employee employee)
    {
        try
        {
            employee.Id = Guid.NewGuid().ToString();
            employee.CreatedAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<Employee>()
                .Insert(employee);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            throw;
        }
    }

    public async Task<Employee> UpdateAsync(Employee employee)
    {
        try
        {
            employee.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<Employee>()
                .Where(e => e.Id == employee.Id)
                .Update(employee);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee: {Id}", employee.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            await _supabase
                .From<Employee>()
                .Where(e => e.Id == id)
                .Delete();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee: {Id}", id);
            return false;
        }
    }

    public async Task<bool> ExistsAsync(string employeeCode)
    {
        try
        {
            var response = await _supabase
                .From<Employee>()
                .Where(e => e.EmployeeCode == employeeCode)
                .Get();

            return response.Models.Any();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking employee existence");
            return false;
        }
    }
}
