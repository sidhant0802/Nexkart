// backend/src/middlewares/reviewRateLimit.js
const { getCache, setCache, redis } = require("../config/redis");

/**
 * User-level review rate limit using Redis
 * Limits: 5 reviews per minute per user
 */
const reviewRateLimit = async (req, res, next) => {
  try {
    const user = await req.user;
    if (!user || !user._id) {
      return next();   // Auth middleware will handle no-user case
    }

    const key       = `ratelimit:review:${user._id}`;
    const r         = redis();

    if (!r) return next();   // If Redis down, allow request

    const count = await r.incr(key);

    if (count === 1) {
      // First request in this window — set 60 sec expiry
      await r.expire(key, 60);
    }

    if (count > 5) {
      const ttl = await r.ttl(key);
      return res.status(429).json({
        error: `Too many reviews. Please wait ${ttl} seconds.`,
        retryAfter: ttl,
      });
    }

    res.setHeader("X-RateLimit-Limit",     5);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, 5 - count));

    next();
  } catch (err) {
    console.error("Review rate limit error:", err.message);
    next();   // Don't break on Redis errors
  }
};

module.exports = reviewRateLimit;