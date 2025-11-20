using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;
using EmployeeMvp.Models;
using EmployeeMvp.Services;

namespace EmployeeMvp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(
        IEmployeeRepository employeeRepository,
        IUserRepository userRepository,
        ICacheService cacheService,
        ILogger<EmployeesController> logger)
    {
        _employeeRepository = employeeRepository;
        _userRepository = userRepository;
        _cacheService = cacheService;
        _logger = logger;
    }

    /// <summary>
    /// Get all employees (cached for 5 minutes)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<EmployeeResponse>>>> GetAll()
    {
        try
        {
            const string cacheKey = "employees:all";
            
            // Try cache first
            var cachedEmployees = await _cacheService.GetAsync<List<EmployeeResponse>>(cacheKey);
            if (cachedEmployees != null)
            {
                _logger.LogInformation("⚡ Returning {Count} employees from cache", cachedEmployees.Count);
                return Ok(ApiResponse<List<EmployeeResponse>>.SuccessResponse(
                    cachedEmployees,
                    "Employees retrieved from cache"));
            }

            // Cache miss - fetch from database
            _logger.LogInformation("📊 Fetching employees from database...");
            
            var employees = await _employeeRepository.GetAllAsync();
            var users = await _userRepository.GetAllAsync();

            var response = employees.Select(e =>
            {
                var user = users.FirstOrDefault(u => u.Id == e.UserId);
                return new EmployeeResponse
                {
                    Id = e.Id,
                    UserId = e.UserId,
                    EmployeeCode = e.EmployeeCode,
                    DepartmentId = e.DepartmentId,
                    Position = e.Position,
                    EmploymentType = e.EmploymentType,
                    HireDate = e.HireDate,
                    Salary = e.Salary,
                    Phone = e.Phone,
                    Address = e.Address,
                    PerformanceRating = e.PerformanceRating,
                    FullName = user?.FullName ?? "Unknown",
                    Email = user?.Email ?? "",
                    CreatedAt = e.CreatedAt
                };
            }).ToList();

            // Cache for 5 minutes
            await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5));

            return Ok(ApiResponse<List<EmployeeResponse>>.SuccessResponse(
                response,
                $"Retrieved {response.Count} employees and cached"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all employees");
            return StatusCode(500, ApiResponse<List<EmployeeResponse>>.ErrorResponse(
                "An error occurred while fetching employees"));
        }
    }

    /// <summary>
    /// Get employee by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EmployeeResponse>>> GetById(string id)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            
            if (employee == null)
            {
                return NotFound(ApiResponse<EmployeeResponse>.ErrorResponse(
                    $"Employee not found with ID: {id}"));
            }

            var user = await _userRepository.GetByIdAsync(employee.UserId);

            var response = new EmployeeResponse
            {
                Id = employee.Id,
                UserId = employee.UserId,
                EmployeeCode = employee.EmployeeCode,
                DepartmentId = employee.DepartmentId,
                Position = employee.Position,
                EmploymentType = employee.EmploymentType,
                HireDate = employee.HireDate,
                Salary = employee.Salary,
                Phone = employee.Phone,
                Address = employee.Address,
                PerformanceRating = employee.PerformanceRating,
                FullName = user?.FullName ?? "Unknown",
                Email = user?.Email ?? "",
                CreatedAt = employee.CreatedAt
            };

            return Ok(ApiResponse<EmployeeResponse>.SuccessResponse(
                response,
                "Employee retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee by ID: {Id}", id);
            return StatusCode(500, ApiResponse<EmployeeResponse>.ErrorResponse(
                "An error occurred while fetching employee"));
        }
    }

    /// <summary>
    /// Get employee by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<EmployeeResponse>>> GetByUserId(string userId)
    {
        try
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            
            if (employee == null)
            {
                return NotFound(ApiResponse<EmployeeResponse>.ErrorResponse(
                    $"Employee not found for user ID: {userId}"));
            }

            var user = await _userRepository.GetByIdAsync(employee.UserId);

            var response = new EmployeeResponse
            {
                Id = employee.Id,
                UserId = employee.UserId,
                EmployeeCode = employee.EmployeeCode,
                DepartmentId = employee.DepartmentId,
                Position = employee.Position,
                EmploymentType = employee.EmploymentType,
                HireDate = employee.HireDate,
                Salary = employee.Salary,
                Phone = employee.Phone,
                Address = employee.Address,
                PerformanceRating = employee.PerformanceRating,
                FullName = user?.FullName ?? "Unknown",
                Email = user?.Email ?? "",
                CreatedAt = employee.CreatedAt
            };

            return Ok(ApiResponse<EmployeeResponse>.SuccessResponse(
                response,
                "Employee retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee by user ID: {UserId}", userId);
            return StatusCode(500, ApiResponse<EmployeeResponse>.ErrorResponse(
                "An error occurred while fetching employee"));
        }
    }

    /// <summary>
    /// Create new employee
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<EmployeeResponse>>> Create([FromBody] CreateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<EmployeeResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            // Check if employee code already exists
            if (await _employeeRepository.ExistsAsync(request.EmployeeCode))
            {
                return BadRequest(ApiResponse<EmployeeResponse>.ErrorResponse(
                    "Employee code already exists"));
            }

            // Check if user exists
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return NotFound(ApiResponse<EmployeeResponse>.ErrorResponse(
                    "User not found with the provided ID"));
            }

            var employee = new Employee
            {
                UserId = request.UserId,
                EmployeeCode = request.EmployeeCode,
                DepartmentId = request.DepartmentId,
                Position = request.Position,
                EmploymentType = request.EmploymentType,
                HireDate = request.HireDate,
                Salary = request.Salary,
                Phone = request.Phone,
                Address = request.Address,
                EmergencyContact = request.EmergencyContact,
                EmergencyPhone = request.EmergencyPhone,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                PerformanceRating = request.PerformanceRating
            };

            var created = await _employeeRepository.CreateAsync(employee);

            // Invalidate cache after creating employee
            await _cacheService.RemoveAsync("employees:all");
            await _cacheService.RemoveAsync("dashboard:stats");
            _logger.LogInformation("🗑️ Cache cleared after employee creation");

            var response = new EmployeeResponse
            {
                Id = created.Id,
                UserId = created.UserId,
                EmployeeCode = created.EmployeeCode,
                DepartmentId = created.DepartmentId,
                Position = created.Position,
                EmploymentType = created.EmploymentType,
                HireDate = created.HireDate,
                Salary = created.Salary,
                Phone = created.Phone,
                Address = created.Address,
                PerformanceRating = created.PerformanceRating,
                FullName = user.FullName,
                Email = user.Email,
                CreatedAt = created.CreatedAt
            };

            _logger.LogInformation("Employee created successfully: {EmployeeCode}", created.EmployeeCode);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                ApiResponse<EmployeeResponse>.SuccessResponse(response, "Employee created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return StatusCode(500, ApiResponse<EmployeeResponse>.ErrorResponse(
                "An error occurred while creating employee"));
        }
    }

    /// <summary>
    /// Update employee
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<EmployeeResponse>>> Update(string id, [FromBody] UpdateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<EmployeeResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            var employee = await _employeeRepository.GetByIdAsync(id);
            
            if (employee == null)
            {
                return NotFound(ApiResponse<EmployeeResponse>.ErrorResponse(
                    $"Employee not found with ID: {id}"));
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(request.Position))
                employee.Position = request.Position;
            
            if (!string.IsNullOrEmpty(request.EmploymentType))
                employee.EmploymentType = request.EmploymentType;
            
            if (request.DepartmentId != null)
                employee.DepartmentId = request.DepartmentId;
            
            if (request.Salary.HasValue)
                employee.Salary = request.Salary;
            
            if (request.Phone != null)
                employee.Phone = request.Phone;
            
            if (request.Address != null)
                employee.Address = request.Address;
            
            if (request.EmergencyContact != null)
                employee.EmergencyContact = request.EmergencyContact;
            
            if (request.EmergencyPhone != null)
                employee.EmergencyPhone = request.EmergencyPhone;
            
            if (request.PerformanceRating.HasValue)
                employee.PerformanceRating = request.PerformanceRating;

            var updated = await _employeeRepository.UpdateAsync(employee);
            var user = await _userRepository.GetByIdAsync(updated.UserId);

            // Invalidate cache after update
            await _cacheService.RemoveAsync("employees:all");
            await _cacheService.RemoveAsync("dashboard:stats");
            _logger.LogInformation("🗑️ Cache cleared after employee update");

            var response = new EmployeeResponse
            {
                Id = updated.Id,
                UserId = updated.UserId,
                EmployeeCode = updated.EmployeeCode,
                DepartmentId = updated.DepartmentId,
                Position = updated.Position,
                EmploymentType = updated.EmploymentType,
                HireDate = updated.HireDate,
                Salary = updated.Salary,
                Phone = updated.Phone,
                Address = updated.Address,
                PerformanceRating = updated.PerformanceRating,
                FullName = user?.FullName ?? "Unknown",
                Email = user?.Email ?? "",
                CreatedAt = updated.CreatedAt
            };

            _logger.LogInformation("Employee updated successfully: {Id}", id);

            return Ok(ApiResponse<EmployeeResponse>.SuccessResponse(
                response,
                "Employee updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee: {Id}", id);
            return StatusCode(500, ApiResponse<EmployeeResponse>.ErrorResponse(
                "An error occurred while updating employee"));
        }
    }

    /// <summary>
    /// Delete employee
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            
            if (employee == null)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(
                    $"Employee not found with ID: {id}"));
            }

            var result = await _employeeRepository.DeleteAsync(id);

            if (result)
            {
                // Invalidate cache after delete
                await _cacheService.RemoveAsync("employees:all");
                await _cacheService.RemoveAsync("dashboard:stats");
                _logger.LogInformation("🗑️ Cache cleared after employee deletion");
                
                _logger.LogInformation("Employee deleted successfully: {Id}", id);
                return Ok(ApiResponse<bool>.SuccessResponse(
                    true,
                    "Employee deleted successfully"));
            }

            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "Failed to delete employee"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee: {Id}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "An error occurred while deleting employee"));
        }
    }
}
