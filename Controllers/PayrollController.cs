using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;

namespace EmployeeMvp.Controllers;

/// <summary>
/// API Controller for managing payroll records
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollRepository _payrollRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILogger<PayrollController> _logger;

    public PayrollController(
        IPayrollRepository payrollRepository,
        IEmployeeRepository employeeRepository,
        ILogger<PayrollController> logger)
    {
        _payrollRepository = payrollRepository;
        _employeeRepository = employeeRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all payroll records
    /// </summary>
    /// <returns>List of all payroll records with employee details</returns>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PayrollResponse>>>> GetAll()
    {
        try
        {
            var payrolls = await _payrollRepository.GetAllAsync();
            var employees = await _employeeRepository.GetAllAsync();

            var response = payrolls.Select(p =>
            {
                var employee = employees.FirstOrDefault(e => e.Id == p.EmployeeId);
                return new PayrollResponse
                {
                    Id = p.Id,
                    EmployeeId = p.EmployeeId,
                    EmployeeName = employee?.User?.FullName ?? "Unknown",
                    EmployeeCode = employee?.EmployeeCode ?? "",
                    Position = employee?.Position ?? "",
                    Month = p.Month,
                    Year = p.Year,
                    BasicSalary = p.BasicSalary,
                    Allowances = p.Allowances,
                    Bonuses = p.Bonuses,
                    Deductions = p.Deductions,
                    Tax = p.Tax,
                    NetSalary = p.NetSalary,
                    PaymentDate = p.PaymentDate,
                    PaymentStatus = p.PaymentStatus,
                    PaymentMethod = p.PaymentMethod,
                    ProcessedBy = p.ProcessedBy,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                };
            }).ToList();

            return Ok(ApiResponse<List<PayrollResponse>>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all payroll records");
            return StatusCode(500, ApiResponse<List<PayrollResponse>>.ErrorResponse("Internal server error while retrieving payroll records."));
        }
    }

    /// <summary>
    /// Get payroll record by ID
    /// </summary>
    /// <param name="id">Payroll record ID</param>
    /// <returns>Payroll record details</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PayrollResponse>>> GetById(string id)
    {
        try
        {
            var payroll = await _payrollRepository.GetByIdAsync(id);
            if (payroll == null)
            {
                return NotFound(ApiResponse<PayrollResponse>.ErrorResponse($"Payroll record with ID {id} not found."));
            }

            var employee = await _employeeRepository.GetByIdAsync(payroll.EmployeeId);

            var response = new PayrollResponse
            {
                Id = payroll.Id,
                EmployeeId = payroll.EmployeeId,
                EmployeeName = employee?.User?.FullName ?? "Unknown",
                EmployeeCode = employee?.EmployeeCode ?? "",
                Position = employee?.Position ?? "",
                Month = payroll.Month,
                Year = payroll.Year,
                BasicSalary = payroll.BasicSalary,
                Allowances = payroll.Allowances,
                Bonuses = payroll.Bonuses,
                Deductions = payroll.Deductions,
                Tax = payroll.Tax,
                NetSalary = payroll.NetSalary,
                PaymentDate = payroll.PaymentDate,
                PaymentStatus = payroll.PaymentStatus,
                PaymentMethod = payroll.PaymentMethod,
                ProcessedBy = payroll.ProcessedBy,
                CreatedAt = payroll.CreatedAt,
                UpdatedAt = payroll.UpdatedAt
            };

            return Ok(ApiResponse<PayrollResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payroll record {PayrollId}", id);
            return StatusCode(500, ApiResponse<PayrollResponse>.ErrorResponse("Internal server error while retrieving payroll record."));
        }
    }

    /// <summary>
    /// Get payroll records for a specific employee
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <returns>List of payroll records for the employee</returns>
    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<ApiResponse<List<PayrollResponse>>>> GetByEmployeeId(string employeeId)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null)
            {
                return NotFound(ApiResponse<List<PayrollResponse>>.ErrorResponse($"Employee with ID {employeeId} not found."));
            }

            var payrolls = await _payrollRepository.GetByEmployeeIdAsync(employeeId);

            var response = payrolls.Select(p => new PayrollResponse
            {
                Id = p.Id,
                EmployeeId = p.EmployeeId,
                EmployeeName = employee.User?.FullName ?? "Unknown",
                EmployeeCode = employee.EmployeeCode ?? "",
                Position = employee.Position ?? "",
                Month = p.Month,
                Year = p.Year,
                BasicSalary = p.BasicSalary,
                Allowances = p.Allowances,
                Bonuses = p.Bonuses,
                Deductions = p.Deductions,
                Tax = p.Tax,
                NetSalary = p.NetSalary,
                PaymentDate = p.PaymentDate,
                PaymentStatus = p.PaymentStatus,
                PaymentMethod = p.PaymentMethod,
                ProcessedBy = p.ProcessedBy,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList();

            return Ok(ApiResponse<List<PayrollResponse>>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payroll records for employee {EmployeeId}", employeeId);
            return StatusCode(500, ApiResponse<List<PayrollResponse>>.ErrorResponse("Internal server error while retrieving employee payroll records."));
        }
    }

    /// <summary>
    /// Create a new payroll record
    /// </summary>
    /// <param name="request">Payroll creation details</param>
    /// <returns>Created payroll record</returns>
    [HttpPost]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<PayrollResponse>>> Create([FromBody] CreatePayrollRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
            return BadRequest(ApiResponse<PayrollResponse>.ErrorResponse("Validation failed.", errors));
        }

        try
        {
            // Validate employee exists
            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                return NotFound(ApiResponse<PayrollResponse>.ErrorResponse($"Employee with ID {request.EmployeeId} not found."));
            }

            // Check for duplicate payroll (same employee, month, year)
            var existing = await _payrollRepository.GetByEmployeeMonthYearAsync(
                request.EmployeeId,
                request.Month,
                request.Year
            );

            if (existing != null)
            {
                return BadRequest(ApiResponse<PayrollResponse>.ErrorResponse(
                    $"Payroll record already exists for {employee.User?.FullName} for {request.Month}/{request.Year}."
                ));
            }

            // Calculate net salary
            decimal netSalary = request.BasicSalary 
                              + request.Allowances 
                              + request.Bonuses 
                              - request.Deductions 
                              - request.Tax;

            var payroll = new Models.Payroll
            {
                Id = Guid.NewGuid().ToString(),
                EmployeeId = request.EmployeeId,
                Month = request.Month,
                Year = request.Year,
                BasicSalary = request.BasicSalary,
                Allowances = request.Allowances,
                Bonuses = request.Bonuses,
                Deductions = request.Deductions,
                Tax = request.Tax,
                NetSalary = netSalary,
                PaymentDate = request.PaymentDate,
                PaymentStatus = request.PaymentStatus,
                PaymentMethod = request.PaymentMethod,
                ProcessedBy = request.ProcessedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _payrollRepository.CreateAsync(payroll);

            var response = new PayrollResponse
            {
                Id = created.Id,
                EmployeeId = created.EmployeeId,
                EmployeeName = employee.User?.FullName ?? "Unknown",
                EmployeeCode = employee.EmployeeCode ?? "",
                Position = employee.Position ?? "",
                Month = created.Month,
                Year = created.Year,
                BasicSalary = created.BasicSalary,
                Allowances = created.Allowances,
                Bonuses = created.Bonuses,
                Deductions = created.Deductions,
                Tax = created.Tax,
                NetSalary = created.NetSalary,
                PaymentDate = created.PaymentDate,
                PaymentStatus = created.PaymentStatus,
                PaymentMethod = created.PaymentMethod,
                ProcessedBy = created.ProcessedBy,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };

            _logger.LogInformation("Created payroll record for employee {EmployeeId} - {Month}/{Year}", 
                request.EmployeeId, request.Month, request.Year);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, 
                ApiResponse<PayrollResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payroll record for employee {EmployeeId}: {Message}", 
                request.EmployeeId, ex.Message);
            return StatusCode(500, ApiResponse<PayrollResponse>.ErrorResponse(
                $"Internal server error while creating payroll record: {ex.Message}"));
        }
    }

    /// <summary>
    /// Update an existing payroll record
    /// </summary>
    /// <param name="id">Payroll record ID</param>
    /// <param name="request">Updated payroll details</param>
    /// <returns>Updated payroll record</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "admin,manager")]
    public async Task<ActionResult<ApiResponse<PayrollResponse>>> Update(string id, [FromBody] CreatePayrollRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
            return BadRequest(ApiResponse<PayrollResponse>.ErrorResponse("Validation failed.", errors));
        }

        try
        {
            var payroll = await _payrollRepository.GetByIdAsync(id);
            if (payroll == null)
            {
                return NotFound(ApiResponse<PayrollResponse>.ErrorResponse($"Payroll record with ID {id} not found."));
            }

            // Calculate net salary
            decimal netSalary = request.BasicSalary 
                              + request.Allowances 
                              + request.Bonuses 
                              - request.Deductions 
                              - request.Tax;

            // Update fields
            payroll.BasicSalary = request.BasicSalary;
            payroll.Allowances = request.Allowances;
            payroll.Bonuses = request.Bonuses;
            payroll.Deductions = request.Deductions;
            payroll.Tax = request.Tax;
            payroll.NetSalary = netSalary;
            payroll.PaymentDate = request.PaymentDate;
            payroll.PaymentStatus = request.PaymentStatus;
            payroll.PaymentMethod = request.PaymentMethod;
            payroll.ProcessedBy = request.ProcessedBy;
            payroll.UpdatedAt = DateTime.UtcNow;

            var updated = await _payrollRepository.UpdateAsync(payroll);

            var employee = await _employeeRepository.GetByIdAsync(updated.EmployeeId);

            var response = new PayrollResponse
            {
                Id = updated.Id,
                EmployeeId = updated.EmployeeId,
                EmployeeName = employee?.User?.FullName ?? "Unknown",
                EmployeeCode = employee?.EmployeeCode ?? "",
                Position = employee?.Position ?? "",
                Month = updated.Month,
                Year = updated.Year,
                BasicSalary = updated.BasicSalary,
                Allowances = updated.Allowances,
                Bonuses = updated.Bonuses,
                Deductions = updated.Deductions,
                Tax = updated.Tax,
                NetSalary = updated.NetSalary,
                PaymentDate = updated.PaymentDate,
                PaymentStatus = updated.PaymentStatus,
                PaymentMethod = updated.PaymentMethod,
                ProcessedBy = updated.ProcessedBy,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
            };

            _logger.LogInformation("Updated payroll record {PayrollId}", id);

            return Ok(ApiResponse<PayrollResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payroll record {PayrollId}", id);
            return StatusCode(500, ApiResponse<PayrollResponse>.ErrorResponse("Internal server error while updating payroll record."));
        }
    }

    /// <summary>
    /// Delete a payroll record
    /// </summary>
    /// <param name="id">Payroll record ID</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(string id)
    {
        try
        {
            var payroll = await _payrollRepository.GetByIdAsync(id);
            if (payroll == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse($"Payroll record with ID {id} not found."));
            }

            await _payrollRepository.DeleteAsync(id);

            _logger.LogInformation("Deleted payroll record {PayrollId}", id);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                message = "Payroll record deleted successfully.",
                deletedId = id
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting payroll record {PayrollId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Internal server error while deleting payroll record."));
        }
    }
}
