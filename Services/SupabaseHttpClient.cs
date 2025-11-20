using System.Text;
using System.Text.Json;

namespace EmployeeMvp.Services;

public interface ISupabaseHttpClient
{
    Task<T> GetAsync<T>(string table, string? filter = null);
    Task<T> PostAsync<T>(string table, object data);
    Task<T> PatchAsync<T>(string table, string id, object data);
    Task DeleteAsync(string table, string id);
}

public class SupabaseHttpClient : ISupabaseHttpClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SupabaseHttpClient> _logger;

    public SupabaseHttpClient(HttpClient httpClient, Config.SupabaseConfig config, ILogger<SupabaseHttpClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        _httpClient.BaseAddress = new Uri($"{config.Url}/rest/v1/");
        _httpClient.DefaultRequestHeaders.Add("apikey", config.Key);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {config.Key}");
        _httpClient.DefaultRequestHeaders.Add("Prefer", "return=representation");
    }

    public async Task<T> GetAsync<T>(string table, string? filter = null)
    {
        var url = string.IsNullOrEmpty(filter) ? table : $"{table}?{filter}";
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    public async Task<T> PostAsync<T>(string table, object data)
    {
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });
        
        _logger.LogInformation("POST to {Table}: {Json}", table, json);
        
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(table, content);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("POST failed: {StatusCode} - {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Supabase POST failed: {response.StatusCode} - {error}");
        }
        
        var responseJson = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("POST response: {Response}", responseJson);
        
        // Supabase returns array with single item
        var result = JsonSerializer.Deserialize<List<T>>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return result!.First();
    }

    public async Task<T> PatchAsync<T>(string table, string id, object data)
    {
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });
        
        _logger.LogInformation("PATCH to {Table} (ID: {Id}): {Json}", table, id, json);
        
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PatchAsync($"{table}?id=eq.{id}", content);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("PATCH failed: {StatusCode} - {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Supabase PATCH failed: {response.StatusCode} - {error}");
        }
        
        var responseJson = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("PATCH response: {Response}", responseJson);
        
        var result = JsonSerializer.Deserialize<List<T>>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return result!.First();
    }

    public async Task DeleteAsync(string table, string id)
    {
        var response = await _httpClient.DeleteAsync($"{table}?id=eq.{id}");
        response.EnsureSuccessStatusCode();
    }
}
