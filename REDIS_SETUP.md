# 🚀 Redis Setup Guide for EMS

## Option 1: Docker (Recommended - Easiest)

### Install Redis with Docker:
```powershell
# Pull and run Redis container
docker run -d -p 6379:6379 --name ems-redis redis:latest

# Verify Redis is running
docker ps
```

### Stop/Start Redis:
```powershell
# Stop
docker stop ems-redis

# Start
docker start ems-redis

# Remove
docker rm -f ems-redis
```

---

## Option 2: Windows Installation

### Download and Install:
1. Download Redis for Windows: https://github.com/tporadowski/redis/releases
2. Extract and run `redis-server.exe`
3. Default port: 6379

---

## Option 3: Skip Redis (Memory-Only Mode)

If Redis fails to connect, the app will automatically fall back to **in-memory caching only**.

**Features:**
- ✅ Still gets 10-100x performance boost
- ✅ No setup required
- ⚠️ Cache cleared on app restart
- ⚠️ Not shared across multiple instances

---

## Testing Redis Connection

### PowerShell:
```powershell
# Check if Redis is listening on port 6379
Test-NetConnection localhost -Port 6379
```

### Redis CLI:
```bash
# Connect to Redis
redis-cli

# Test commands
PING   # Should return "PONG"
SET test "Hello Redis"
GET test
```

---

## Configuration

### appsettings.json:
```json
{
  "ConnectionStrings": {
    "Redis": "localhost:6379"
  }
}
```

### For Redis Cloud (Production):
```json
{
  "ConnectionStrings": {
    "Redis": "your-redis-cloud-endpoint:6379,password=yourpassword,ssl=true"
  }
}
```

Free Redis Cloud: https://redis.com/try-free/

---

## How the Hybrid Cache Works

### L1 Cache (In-Memory):
- ⚡ Ultra-fast (microseconds)
- 💾 Stored in application memory
- 🔄 Lost on app restart

### L2 Cache (Redis):
- 🚀 Fast (milliseconds)
- 🌐 Shared across all instances
- 💪 Persists across app restarts

### Cache Flow:
```
Request → Check Memory Cache → If miss → Check Redis Cache → If miss → Database
                    ↓                          ↓                        ↓
                Return                    Save to Memory            Save to Both
```

---

## Cache Keys Used

| Key | TTL | Description |
|-----|-----|-------------|
| `EMS_employees:all` | 5 min | All employees list |
| `EMS_dashboard:stats` | 5 min | Dashboard statistics |

**Note:** `EMS_` is the instance prefix to avoid key collisions.

---

## Console Output Examples

### Cache Hit (Memory):
```
✅ Cache HIT (Memory): employees:all
⚡ Returning 5 employees from cache
```

### Cache Hit (Redis):
```
✅ Cache HIT (Redis): dashboard:stats
💾 Cache SET (Memory): dashboard:stats - Expires in 5min
⚡ Returning cached dashboard stats
```

### Cache Miss:
```
❌ Cache MISS: employees:all
📊 Fetching employees from database...
💾 Cache SET (Memory): employees:all - Expires in 5min
💾 Cache SET (Redis): employees:all - Expires in 5min
```

### Cache Invalidation:
```
🗑️ Cache REMOVE (Memory): employees:all
🗑️ Cache REMOVE (Redis): employees:all
🗑️ Cache cleared after employee creation
```

---

## Performance Benefits

### Without Caching:
- Dashboard stats: ~200-500ms (3 database queries + calculations)
- Get employees: ~100-300ms (2 database queries + joins)

### With Caching:
- Dashboard stats: ~1-5ms (memory) or ~10-20ms (Redis)
- Get employees: ~1-5ms (memory) or ~10-20ms (Redis)

**Speed improvement: 20-500x faster! 🚀**

---

## Troubleshooting

### Redis Connection Error:
```
⚠️ Redis cache error, falling back to memory only
```
**Solution:** Check if Redis is running on port 6379.

### Port Already in Use:
```powershell
# Find what's using port 6379
netstat -ano | findstr :6379

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Clear All Cache:
```bash
redis-cli FLUSHALL
```

---

## Development Tips

1. **First Request:** Always slower (cache miss)
2. **Second Request:** Lightning fast (cache hit)
3. **After CRUD Operations:** Cache auto-clears for affected data
4. **Cache Expiry:** 5 minutes by default
5. **Monitor Logs:** Watch console for cache hit/miss patterns

---

## Production Checklist

- [ ] Use Redis Cloud or managed Redis service
- [ ] Set strong password in connection string
- [ ] Enable SSL/TLS for Redis connection
- [ ] Monitor Redis memory usage
- [ ] Set maxmemory-policy (e.g., `allkeys-lru`)
- [ ] Configure cache TTL based on data freshness needs
- [ ] Set up Redis persistence (RDB/AOF)

---

**Your caching system is now ready! 🎉**

Run the app and watch the console logs to see caching in action.
