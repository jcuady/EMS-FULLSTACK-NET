using EmployeeMvp.Config;
using EmployeeMvp.Services;
using EmployeeMvp.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel - Railway handles HTTPS at the load balancer level
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    // In production (Railway), only use HTTP as Railway handles HTTPS termination
    var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
    var isDevelopment = builder.Environment.IsDevelopment();
    
    if (isDevelopment)
    {
        // Development: Use both HTTP and HTTPS
        serverOptions.ListenLocalhost(5000); // HTTP
        serverOptions.ListenLocalhost(5001, listenOptions =>
        {
            listenOptions.UseHttps(); // HTTPS with development certificate
        });
    }
    else
    {
        // Production (Railway): Only HTTP, Railway handles HTTPS termination
        serverOptions.ListenAnyIP(int.Parse(port));
    }
});

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Register Supabase configuration
builder.Services.AddSingleton<SupabaseConfig>();

// Register Supabase client factory as Singleton
builder.Services.AddSingleton<SupabaseClientFactory>();

// Register Supabase client
builder.Services.AddScoped(sp =>
{
    var factory = sp.GetRequiredService<SupabaseClientFactory>();
    return factory.GetClientAsync().Result;
});

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IPayrollRepository, PayrollRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<ILeaveRepository, LeaveRepository>();
builder.Services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();

// Register HTTP Client for Supabase direct access
builder.Services.AddHttpClient<ISupabaseHttpClient, SupabaseHttpClient>();

// Register JWT Service
builder.Services.AddScoped<IJwtService, JwtService>();

// Register Report Service
builder.Services.AddScoped<IReportService, ReportService>();

// Register Audit Service
builder.Services.AddScoped<IAuditService, AuditService>();

// Add Caching (In-Memory + Redis)
builder.Services.AddMemoryCache();
builder.Services.AddStackExchangeRedisCache(options =>
{
    // Use local Redis instance (install with: docker run -d -p 6379:6379 redis)
    // Or use Redis Cloud free tier: redis.com
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    options.InstanceName = "EMS_";
});
builder.Services.AddScoped<ICacheService, HybridCacheService>();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Add Controllers
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "http://localhost:3001", 
                "http://localhost:3002",
                "https://localhost:3000",
                "https://localhost:3001",
                "https://localhost:3002",
                "https://ems-fullstack-net.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

// Use CORS (must be before Authentication/Authorization)
app.UseCors();

// Use Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Initialize Supabase client on startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
var supabaseFactory = app.Services.GetRequiredService<SupabaseClientFactory>();

try
{
    logger.LogInformation("Starting Employee Management System API...");
    var client = await supabaseFactory.GetClientAsync();
    logger.LogInformation("Supabase connection established successfully!");
}
catch (Exception ex)
{
    logger.LogError(ex, "Failed to initialize Supabase connection on startup.");
    throw;
}

// Map Controllers
app.MapControllers();

// Root endpoint
app.MapGet("/", () => new
{
    message = "Employee Management System API",
    status = "Running",
    version = "1.0.0",
    supabase = "Connected",
    endpoints = new
    {
        auth = "/api/auth",
        employees = "/api/employees",
        attendance = "/api/attendance",
        payroll = "/api/payroll",
        dashboard = "/api/dashboard",
        notifications = "/api/notification",
        leave = "/api/leave",
        reports = "/api/reports",
        audit = "/api/audit"
    }
});

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    uptime = DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime
}));

logger.LogInformation("🚀 API started successfully!");
logger.LogInformation("🔗 HTTP:  http://localhost:5000");
logger.LogInformation("🔒 HTTPS: https://localhost:5001");
logger.LogInformation("🛡️  Security: JWT Authentication + Role-based Authorization");

app.Run();
