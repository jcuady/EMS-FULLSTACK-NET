using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace EmployeeMvp.Services;

public class HybridCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache _distributedCache;
    private readonly ILogger<HybridCacheService> _logger;
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(5);

    public HybridCacheService(
        IMemoryCache memoryCache,
        IDistributedCache distributedCache,
        ILogger<HybridCacheService> logger)
    {
        _memoryCache = memoryCache;
        _distributedCache = distributedCache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        // Try memory cache first (L1 - fastest)
        if (_memoryCache.TryGetValue(key, out T? cachedValue))
        {
            _logger.LogInformation("✅ Cache HIT (Memory): {Key}", key);
            return cachedValue;
        }

        // Try Redis cache (L2 - shared across instances)
        try
        {
            var redisValue = await _distributedCache.GetStringAsync(key);
            if (redisValue != null)
            {
                _logger.LogInformation("✅ Cache HIT (Redis): {Key}", key);
                var value = JsonSerializer.Deserialize<T>(redisValue);
                
                // Populate memory cache for next time
                _memoryCache.Set(key, value, _defaultExpiration);
                
                return value;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Redis cache error, falling back to memory only for key: {Key}", key);
        }

        _logger.LogInformation("❌ Cache MISS: {Key}", key);
        return default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var expirationTime = expiration ?? _defaultExpiration;

        // Set in memory cache (L1)
        _memoryCache.Set(key, value, expirationTime);
        _logger.LogInformation("💾 Cache SET (Memory): {Key} - Expires in {Minutes}min", key, expirationTime.TotalMinutes);

        // Set in Redis cache (L2)
        try
        {
            var serializedValue = JsonSerializer.Serialize(value);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expirationTime
            };
            
            await _distributedCache.SetStringAsync(key, serializedValue, options);
            _logger.LogInformation("💾 Cache SET (Redis): {Key} - Expires in {Minutes}min", key, expirationTime.TotalMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Failed to set Redis cache for key: {Key}. Memory cache still available.", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        _memoryCache.Remove(key);
        _logger.LogInformation("🗑️ Cache REMOVE (Memory): {Key}", key);

        try
        {
            await _distributedCache.RemoveAsync(key);
            _logger.LogInformation("🗑️ Cache REMOVE (Redis): {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Failed to remove Redis cache for key: {Key}", key);
        }
    }

    public Task RemoveByPrefixAsync(string prefix)
    {
        // Note: This is a simplified version. In production, you'd need Redis SCAN or maintain key sets
        _logger.LogInformation("🗑️ Cache CLEAR by prefix: {Prefix}", prefix);
        
        // For memory cache, we'd need to track keys separately
        // For Redis, you'd use SCAN commands or key patterns
        
        // For now, just log the intention
        _logger.LogWarning("⚠️ RemoveByPrefix not fully implemented - requires key tracking");
        
        return Task.CompletedTask;
    }
}
