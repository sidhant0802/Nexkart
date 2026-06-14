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
const SearchService     = require('./services/SearchService.js');
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

app.set('trust proxy', 1);

// ── Security & Performance ──
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (req.body === null || req.body === undefined) req.body = {};
  next();
});

app.use(globalLimiter);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome To Nexkart Backend System!' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status:    'OK',
    uptime:    process.uptime(),
    timestamp: Date.now(),
  });
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// ── BullMQ Dashboard ──
const { createBullBoard }   = require('@bull-board/api');
const { BullMQAdapter }     = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter }    = require('@bull-board/express');
const {
  emailQueue,
  notificationQueue,
  analyticsQueue,
  abandonedCartQueue,
} = require('./queues/queueConfig');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(analyticsQueue),
    new BullMQAdapter(abandonedCartQueue),
  ],
  serverAdapter,
});

app.use('/queues', (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Resource-Policy');
  next();
}, serverAdapter.getRouter());

// ── Route Imports ──
const checkoutRouters       = require('./routers/checkoutRoutes.js');
const adminProductRouters   = require('./routers/adminProductRoutes.js');
const adminAnalyticsRouters = require('./routers/adminAnalyticsRoutes.js');
const brandRouters          = require('./routers/brandRoutes.js');
const productRouters        = require('./routers/productRoutes.js');
const authRouters           = require('./routers/authRouters.js');
const adminRouters          = require('./routers/adminRouters.js');
const cartRouters           = require('./routers/cartRoutes.js');
const revenueRouters        = require('./routers/revenueRoutes.js');
const sellerOrderRouters    = require('./routers/sellerOrderRoutes.js');
const sellerProductRouters  = require('./routers/sellerProductRoutes.js');
const sellerReportRouters   = require('./routers/sellerReportRoutes.js');
const sellerRouters         = require('./routers/sellerRoutes.js');
const transactionRouters    = require('./routers/transactionRoutes.js');
const userRouters           = require('./routers/userRoutes.js');
const wishlistRouters       = require('./routers/wishlistRoutes.js');
const orderRouters          = require('./routers/orderRoutes.js');
const paymentRoutres        = require('./routers/paymentRoutes.js');
const dealRoutres           = require('./routers/dealRoutes.js');
const couponRouters         = require('./routers/couponRoutes.js');
const homeRouters           = require('./routers/homeCategoryRoutes.js');
const chatboatRouters       = require('./routers/chatboatRoutes.js');
const reviewRouters         = require('./routers/reviewRouters.js');
const bannerRouters         = require('./routers/bannerRoutes.js');
const sectionItemRouters    = require('./routers/sectionItemRoutes.js');
const homeSettingsRouters   = require('./routers/homeSettingsRoutes.js');
const trackingRouters       = require('./routers/trackingRoutes.js');
const searchRouters         = require('./routers/searchRoutes.js');

// ✅ NEW route imports
const returnRoutes       = require('./routers/returnRoutes.js');
const chatRoutes         = require('./routers/chatRoutes.js');
const notificationRoutes = require('./routers/notificationRoutes.js');

// ── Route Registrations ──
app.use('/auth',      authRouters);
app.use('/api/users', userRouters);

app.use('/sellers/send/login-otp',   otpLimiter);
app.use('/sellers/verify/login-otp', authLimiter);
app.use('/sellers/login/password',   authLimiter);
app.use('/sellers', sellerRouters);

app.use('/products',            productRouters);
app.use('/api/sellers/product', sellerProductRouters);
app.use('/api/admin/products',  adminProductRouters);
app.use('/api/admin/analytics', adminAnalyticsRouters);

app.use('/api/brands',          brandRouters);
app.use('/api/cart',            cartRouters);
app.use('/api/orders',          orderRouters);
app.use('/api/seller/orders',   sellerOrderRouters);

app.use('/api/transactions',    transactionRouters);
app.use('/api/wishlist',        wishlistRouters);
app.use('/api/sellers/report',  sellerReportRouters);

app.use('/api/payment',         checkoutLimiter, paymentRoutres);
app.use('/api/checkout',        checkoutLimiter, checkoutRouters);
app.use('/api/sellers/revenue', revenueRouters);

app.use('/api/coupons',         couponRouters);
app.use('/api/reviews',         reviewRouters);
app.use('/chat',                chatboatRouters);
app.use('/api/tracking',        trackingRouters);
app.use('/api/search',          searchRouters);

// ✅ NEW routes
app.use('/api/returns',         returnRoutes);
app.use('/api/chat',            chatRoutes);
app.use('/api/notifications',   notificationRoutes);

// ── Home ──
app.use('/home-page', cache(300), async (req, res) => {
  try {
    const HomeService = require('./services/HomeService');
    const data        = await HomeService.getHomePageData();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
app.use('/home', homeRouters);

// ── Admin ──
app.use('/admin/deals',         dealRoutres);
app.use('/admin/banners',       bannerRouters);
app.use('/admin/section-items', sectionItemRouters);
app.use('/admin/home-settings', homeSettingsRouters);
app.use('/admin',               adminRouters);

// ── Start Server ──
const port = process.env.PORT || 8080;

server.listen(port, async () => {
  await connectDB();
  connectRedis();
  await createIndexes();
  startWorkers();
  initSocket(server);

  try {
    await SearchService.initIndex();
  } catch (err) {
    console.error('Search setup error:', err.message);
  }

  console.log(`✅ Server running on port ${port}`);
  console.log(`📊 Performance: Compression + Helmet + Rate Limit + Indexes`);
  console.log(`🔄 Background workers: Email + Notification + Analytics`);
  console.log(`⚡ Real-time: Socket.IO enabled`);
  console.log(`🔍 Search: MongoDB Atlas Search`);
  console.log(`↩  Returns: Return system active`);
  console.log(`💬 Chat: Order chat active`);
  console.log(`🔔 Notifications: Real-time notifications active`);
});