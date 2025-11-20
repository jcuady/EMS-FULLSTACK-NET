namespace EmployeeMvp.Config;

public class SupabaseConfig
{
    public string Url { get; }
    public string Key { get; }

    public SupabaseConfig()
    {
        // Read from environment variables
        Url = Environment.GetEnvironmentVariable("SUPABASE_URL") 
              ?? "https://rdsjukksghhmacaftszv.supabase.co";
        
        Key = Environment.GetEnvironmentVariable("SUPABASE_KEY") 
              ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkc2p1a2tzZ2hobWFjYWZ0c3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjI2OTUsImV4cCI6MjA3ODYzODY5NX0.BLI7GUJcb6rGkxokHXyzAwxXxjDbIcSfasQhuLzGooQ";
    }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Url))
        {
            throw new InvalidOperationException("Supabase URL is not configured. Set SUPABASE_URL environment variable.");
        }

        if (string.IsNullOrWhiteSpace(Key))
        {
            throw new InvalidOperationException("Supabase Key is not configured. Set SUPABASE_KEY environment variable.");
        }
    }
}
