using EmployeeMvp.Models;
using Supabase;

namespace EmployeeMvp.Repositories;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> UpdateLastLoginAsync(string id);
    Task<User> UpdateAsync(User user);
    Task<User> CreateAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly Client _supabase;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(Client supabase, ILogger<UserRepository> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<List<User>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Fetching all users from public.users table...");
            var response = await _supabase
                .From<User>()
                .Get();

            _logger.LogInformation("Successfully fetched {Count} users", response.Models?.Count ?? 0);
            return response.Models ?? new List<User>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all users - Type: {Type}, Message: {Message}, InnerException: {Inner}, StackTrace: {Stack}", 
                ex.GetType().Name, ex.Message, ex.InnerException?.Message ?? "None", ex.StackTrace);
            throw; // Throw to see actual error in controller
        }
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _supabase
                .From<User>()
                .Where(u => u.Id == id)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user by ID: {Id}", id);
            return null;
        }
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        try
        {
            var response = await _supabase
                .From<User>()
                .Where(u => u.Email == email)
                .Single();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user by email: {Email}", email);
            return null;
        }
    }

    public async Task<User> UpdateLastLoginAsync(string id)
    {
        try
        {
            var user = await GetByIdAsync(id);
            if (user == null)
                throw new Exception($"User not found: {id}");

            user.LastLogin = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<User>()
                .Where(u => u.Id == id)
                .Update(user);

            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating last login for user: {Id}", id);
            throw;
        }
    }

    public async Task<User> UpdateAsync(User user)
    {
        try
        {
            user.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase
                .From<User>()
                .Where(u => u.Id == user.Id)
                .Update(user);

            _logger.LogInformation("User updated successfully: {Id}", user.Id);
            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {Id}", user.Id);
            throw;
        }
    }

    public async Task<User> CreateAsync(User user)
    {
        try
        {
            var response = await _supabase
                .From<User>()
                .Insert(user);

            _logger.LogInformation("User created successfully: {Email}", user.Email);
            return response.Models.First();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user: {Email}", user.Email);
            throw;
        }
    }
}
