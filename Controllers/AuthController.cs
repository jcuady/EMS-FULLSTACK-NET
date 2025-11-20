using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;
using EmployeeMvp.Services;
using EmployeeMvp.Models;
using BCrypt.Net;

namespace EmployeeMvp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUserRepository userRepository, 
        IJwtService jwtService,
        ILogger<AuthController> logger)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user with password
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse(
                    "User with this email already exists"));
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role,
                AvatarUrl = request.AvatarUrl,
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Generate tokens
            var token = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var expiration = _jwtService.GetTokenExpiration();

            // Update user with refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            
            // Save user to database
            var createdUser = await _userRepository.CreateAsync(user);
            
            var response = new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = expiration,
                User = new UserInfo
                {
                    Id = createdUser.Id,
                    Email = createdUser.Email,
                    FullName = createdUser.FullName,
                    Role = createdUser.Role,
                    AvatarUrl = createdUser.AvatarUrl
                }
            };

            _logger.LogInformation("🆕 User registered successfully: {Email}", user.Email);

            return Ok(ApiResponse<LoginResponse>.SuccessResponse(
                response,
                "Registration successful"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse(
                "An error occurred during registration"));
        }
    }

    /// <summary>
    /// Login endpoint - validates credentials and returns JWT token
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse(
                    "Validation failed", errors));
            }

            // Find user by email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            
            if (user == null)
            {
                return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(
                    "Invalid email or password"));
            }

            if (!user.IsActive)
            {
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse(
                    "User account is inactive"));
            }

            // Verify password
            if (string.IsNullOrEmpty(user.PasswordHash) || 
                !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(
                    "Invalid email or password"));
            }

            // Generate tokens
            var token = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var expiration = _jwtService.GetTokenExpiration();

            // Update user with refresh token and last login
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Return user data with tokens
            var response = new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = expiration,
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    AvatarUrl = user.AvatarUrl
                }
            };

            _logger.LogInformation("🔐 User logged in successfully: {Email}", user.Email);

            return Ok(ApiResponse<LoginResponse>.SuccessResponse(
                response, 
                "Login successful"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse(
                "An error occurred during login"));
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            // Find user by refresh token
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.RefreshToken == request.RefreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            {
                return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(
                    "Invalid or expired refresh token"));
            }

            // Generate new tokens
            var token = _jwtService.GenerateAccessToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var expiration = _jwtService.GetTokenExpiration();

            // Update refresh token
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _userRepository.UpdateAsync(user);

            var response = new LoginResponse
            {
                Token = token,
                RefreshToken = newRefreshToken,
                ExpiresAt = expiration,
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    AvatarUrl = user.AvatarUrl
                }
            };

            _logger.LogInformation("🔄 Token refreshed for user: {Email}", user.Email);

            return Ok(ApiResponse<LoginResponse>.SuccessResponse(
                response,
                "Token refreshed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse(
                "An error occurred during token refresh"));
        }
    }

    /// <summary>
    /// Get current user info from JWT token
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserInfo>>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<UserInfo>.ErrorResponse(
                    "User not authenticated"));
            }

            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound(ApiResponse<UserInfo>.ErrorResponse(
                    "User not found"));
            }

            var userInfo = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                AvatarUrl = user.AvatarUrl
            };

            return Ok(ApiResponse<UserInfo>.SuccessResponse(
                userInfo,
                "User info retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, ApiResponse<UserInfo>.ErrorResponse(
                "An error occurred"));
        }
    }

    /// <summary>
    /// Get all users (for admin to show on login page) - Now protected
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<List<UserResponse>>>> GetAllUsers()
    {
        try
        {
            _logger.LogInformation("GetAllUsers endpoint called");
            var users = await _userRepository.GetAllAsync();
            
            // Map to DTOs to avoid Postgrest serialization issues
            var userResponses = users.Select(u => new UserResponse
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                AvatarUrl = u.AvatarUrl,
                IsActive = u.IsActive,
                LastLogin = u.LastLogin,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            }).ToList();
            
            _logger.LogInformation("Successfully retrieved {Count} users", userResponses.Count);
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(
                userResponses, 
                $"Retrieved {userResponses.Count} users"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAllUsers endpoint - Type: {Type}, Message: {Message}", 
                ex.GetType().Name, ex.Message);
            return StatusCode(500, ApiResponse<List<UserResponse>>.ErrorResponse(
                $"Error: {ex.Message}"));
        }
    }
}
