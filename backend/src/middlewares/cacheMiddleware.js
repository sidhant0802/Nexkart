const { getCache, setCache } = require("../config/redis");

/**
 * Generic cache middleware
 * Usage: router.get('/products', cache(300), controller.getProducts)
 *
 * @param {number} ttl - Time to live in seconds (default 5 min)
 */
const cache = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    // Build cache key from URL + query
    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await getCache(key);

      if (cached) {
        // Cache HIT
        res.set("X-Cache", "HIT");
        return res.status(200).json(cached);
      }

      // Cache MISS — wrap res.json to cache the response
      res.set("X-Cache", "MISS");
      const originalJson = res.json.bind(res);

      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          setCache(key, data, ttl).catch(() => {});
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      // If Redis fails, just continue without cache
      console.error("Cache middleware error:", err.message);
      next();
    }
  };
};

module.exports = { cache };