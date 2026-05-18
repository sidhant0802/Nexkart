require('dotenv').config();

const express   = require('express');
const http      = require('http');
const connectDB = require('./config/db.js');
const cors      = require('cors');
const { connectRedis }  = require('./config/redis.js');
const { cache }         = require('./middlewares/cacheMiddleware.js');
const { createIndexes } = require('./config/indexes.js');
const { startWorkers }  = require('./queues/index.js');
const { initSocket }    = require('./config/socket.js');
const SearchService     = require('./services/SearchService.js');     // ✅ NEW
const {
  compressionMiddleware,
  helmetMiddleware,
  globalLimiter,
  authLimiter,
  otpLimiter,
  checkoutLimiter,
} = require('./config/security.js');

const app    = express();
const server = http.createServer(app);

// ✅ Trust proxy (for correct IP behind Nginx/CloudFront)
app.set("trust proxy", 1);

// ✅ Security & Performance
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(cors());

// JSON parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// null body protection
app.use((req, res, next) => {
  if (req.body === null || req.body === undefined) {
    req.body = {};
  }
  next();
});

// ✅ Global rate limiter
app.use(globalLimiter);


const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(analyticsQueue),
    new BullMQAdapter(abandonedCartQueue),
  ],
  serverAdapter,
});

app.use("/queues", (req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Cross-Origin-Resource-Policy");
  next();
}, serverAdapter.getRouter());

// ══════════════════════════════════════════════════════════════
// ── Route Imports ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const checkoutRouters       = require("./routers/checkoutRoutes.js");
const adminProductRouters   = require("./routers/adminProductRoutes.js");
const adminAnalyticsRouters = require("./routers/adminAnalyticsRoutes.js");
const brandRouters          = require("./routers/brandRoutes.js");
const productRouters        = require("./routers/productRoutes.js");
const authRouters           = require("./routers/authRouters.js");
const adminRouters          = require("./routers/adminRouters.js");
const cartRouters           = require("./routers/cartRoutes.js");
const revenueRouters        = require("./routers/revenueRoutes.js");
const sellerOrderRouters    = require("./routers/sellerOrderRoutes.js");
const sellerProductRouters  = require("./routers/sellerProductRoutes.js");
const sellerReportRouters   = require("./routers/sellerReportRoutes.js");
const sellerRouters         = require("./routers/sellerRoutes.js");
const transactionRouters    = require("./routers/transactionRoutes.js");
// ══════════════════════════════════════════════════════════════
// ── Route Registrations ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════

app.use("/auth",      authRouters);
app.use("/api/users", userRouters);

app.use("/sellers/send/login-otp",   otpLimiter);
app.use("/sellers/verify/login-otp", authLimiter);
app.use("/sellers/login/password",   authLimiter);
app.use("/sellers", sellerRouters);

app.use("/products",            productRouters);
app.use("/api/sellers/product", sellerProductRouters);
app.use("/api/admin/products",  adminProductRouters);
app.use("/api/admin/analytics", adminAnalyticsRouters);
