using EmployeeMvp.Config;

namespace EmployeeMvp.Services;

public class SupabaseClientFactory
{
    private readonly SupabaseConfig _config;
    private readonly ILogger<SupabaseClientFactory> _logger;
    private Supabase.Client? _client;
    private readonly SemaphoreSlim _initializationLock = new(1, 1);

    public SupabaseClientFactory(SupabaseConfig config, ILogger<SupabaseClientFactory> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<Supabase.Client> GetClientAsync()
    {
        if (_client != null)
        {
            return _client;
        }

        await _initializationLock.WaitAsync();
        try
        {
            if (_client != null)
            {
                return _client;
            }

            _logger.LogInformation("Initializing Supabase client...");
            _config.Validate();

            var options = new Supabase.SupabaseOptions
            {
                AutoConnectRealtime = true
            };

            _client = new Supabase.Client(_config.Url, _config.Key, options);
            await _client.InitializeAsync();

            _logger.LogInformation("Supabase client initialized successfully.");
            return _client;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Supabase client.");
            throw;
        }
        finally
        {
            _initializationLock.Release();
        }
    }
}
