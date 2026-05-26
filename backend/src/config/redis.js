const Redis = require("ioredis");

let redis = null;

// Connect to Redis
const connectRedis = () => {
  if (redis) return redis;

  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest:  3,
    enableReadyCheck:      true,
    lazyConnect:           false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  return redis;
};

// Get cached data
const getCache = async (key) => {
  try {
    if (!redis) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err.message);
    return null;
  }
};

// Set cache with TTL (in seconds)
const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    if (!redis) return false;
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Redis SET error:", err.message);
    return false;
  }
};

// Delete a specific key
const deleteCache = async (key) => {
  try {
    if (!redis) return false;
    await redis.del(key);
    return true;
  } catch (err) {
    console.error("Redis DEL error:", err.message);
    return false;
  }
};

// Delete keys by pattern (e.g., "product:*")
const deleteCachePattern = async (pattern) => {
  try {
    if (!redis) return false;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (err) {
    console.error("Redis pattern DEL error:", err.message);
    return false;
  }
};

// Cache stats (for monitoring)
const getCacheStats = async () => {
  try {
    if (!redis) return null;
    const info = await redis.info("stats");
    return info;
  } catch (err) {
    return null;
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  getCacheStats,
  redis: () => redis,
};