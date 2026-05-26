const compression = require("compression");
const helmet      = require("helmet");
const rateLimit   = require("express-rate-limit");

// ══════════════════════════════════════════════════════
// COMPRESSION — shrink responses by 70%
// ══════════════════════════════════════════════════════
const compressionMiddleware = compression({
  level:     6,           // Balance speed vs compression
  threshold: 1024,        // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
});

// ══════════════════════════════════════════════════════
// HELMET — security headers (RELAXED for dev tools + Bull Board)
// ══════════════════════════════════════════════════════
const helmetMiddleware = helmet({
  contentSecurityPolicy:     false,     // ✅ Disable CSP (causes DevTools issues)
  crossOriginEmbedderPolicy: false,     // ✅ Allow embedding
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy:   false,     // ✅ Allow popups
  originAgentCluster:        false,     // ✅ Allow multi-origin
});

// ══════════════════════════════════════════════════════
// RATE LIMITERS — block spam/DDoS
// ══════════════════════════════════════════════════════

// Global limit — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      500,
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders:   false,

  // ✅ Existing skips
  skip: (req) => {
    return req.path === "/health"
        || req.path === "/"
        || req.path.startsWith("/admin/queues")
        // ✅ NEW: Skip in load-test mode
        || req.headers["x-loadtest"] === "true";
  },
});

// Strict limit — auth/login routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      10,                // Only 10 login attempts per 15 min
  message: {
    error: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,    // Don't count successful logins
});

// OTP limit — even stricter
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      5,                 // 5 OTPs per hour per IP
  message: {
    error: "Too many OTP requests. Please try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Checkout limit — prevent payment spam
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max:      10,                // 10 checkout attempts per minute
  message: {
    error: "Too many checkout attempts. Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Search limit — prevent search abuse
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max:      60,                // 60 searches per minute (1/sec)
  standardHeaders: true,
  legacyHeaders:   false,
});

// API write limit — for POST/PUT/DELETE
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max:      30,                // 30 writes per minute per IP
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.method === "GET",
});

module.exports = {
  compressionMiddleware,
  helmetMiddleware,
  globalLimiter,
  authLimiter,
  otpLimiter,
  checkoutLimiter,
  searchLimiter,
  writeLimiter,
};