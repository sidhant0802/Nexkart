<div align="center">

<img src="https://via.placeholder.com/120x120/6C63FF/ffffff?text=NK" alt="NexKart Logo" width="120"/>

# NexKart

### Production-Grade Multi-Vendor E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://nexkart-458ojf7ns-sidhant0802s-projects.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-blue?style=for-the-badge&logo=render)](https://nexkart-0th3.onrender.com/health)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

A scalable, production-oriented e-commerce platform inspired by Amazon & Flipkart — built with the MERN stack and TypeScript. Features multi-vendor marketplace support, concurrency-safe inventory management, real-time order tracking, AI-powered shopping assistance, and a Redis-backed caching layer engineered for high throughput.

[Live Demo](https://nexkart-458ojf7ns-sidhant0802s-projects.vercel.app) · [Report Bug](https://github.com/sidhant0802/Nexkart/issues) · [Request Feature](https://github.com/sidhant0802/Nexkart/issues) · [API Health](https://nexkart-0th3.onrender.com/health)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Performance Highlights](#performance-highlights)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Backend Engineering Deep Dive](#backend-engineering-deep-dive)
- [Deployment](#deployment)
- [Load Testing](#load-testing)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

NexKart is a full-stack e-commerce ecosystem where **customers**, **sellers**, and **administrators** interact through a unified platform. It is designed to go beyond typical tutorial projects — focusing on real-world concerns like race condition prevention during flash sales, caching strategies that reduce database load, asynchronous job processing, CDN-optimised media delivery, and role-based access control across three distinct user roles.

The system was load-tested at 500+ concurrent users and handles high-volume purchase attempts without a single oversold item, making it suitable as a reference architecture for production e-commerce systems.

---

## Performance Highlights

| Metric | Result |
|---|---|
| Concurrent users (load test) | 500+ |
| Search API throughput | ~4,500 req/s |
| Search API p50 latency | ~100ms |
| Simultaneous purchase attempts | 2,000+ |
| Oversold scenarios | **0** |
| Inventory integrity | **100%** maintained |

These results were achieved using:

- **Redis-based stock locking** to serialize writes on hot inventory items
- **MongoDB atomic operations** with conditional stock validation
- **Optimised indexes** on frequently queried fields
- **Redis caching** of homepage, product listings, and search suggestions
- **CDN delivery** via Cloudinary for all media assets

---

## Features

### Customer Features

**Authentication & Account Management**
- User registration with OTP email verification
- JWT-based login with refresh token rotation
- Forgot password flow via email
- Profile management and saved address book
- Saved cards management

**Shopping Experience**
- Dynamic homepage with banners, deals, featured products, and category sections — all manageable from the admin panel
- Product browsing by category (multi-level: main → sub → leaf), brand, and deals
- Full-text product search powered by MongoDB Atlas Search
- Smart autocomplete suggestions in the search bar
- Product filtering by price, brand, color, discount percentage, and rating
- Product sorting (price, popularity, rating, newest)
- Zoomable product images
- Product reviews and star ratings
- Similar product recommendations

**Cart & Wishlist**
- Add to cart with real-time quantity controls and price recalculation
- Coupon code application with validation
- Wishlist management — save and remove products
- "Save for later" from cart to wishlist and back

**Checkout & Payments**
- Multi-step checkout: address → review → payment
- Address management during checkout
- Razorpay integration (cards, UPI, net banking, wallets)
- Stripe integration as alternative gateway
- Cash on Delivery support
- Payment webhook verification
- Order confirmation email

**Order Management**
- Complete order history with item-level detail
- Order tracking with live status stepper (confirmed → processing → shipped → delivered)
- Real-time status updates via Socket.IO
- Return request workflow at order-item level
- Order-level chat between customer and seller
- Real-time notifications for status changes

**Other**
- AI-powered shopping chatbot (Gemini AI)
- Dark/light mode theme toggle
- Fully responsive, mobile-first design

---

### Seller Features

**Onboarding & Verification**
- Seller registration with business detail submission
- Admin-gated account verification workflow
- Personal, business, pickup address, and bank detail management

**Product Management**
- Add, edit, and delete product listings
- Upload multiple product images (uploaded to Cloudinary)
- Set pricing, stock, category, and brand
- Browse a marketplace catalog and list from existing products (catalog tab)
- Inventory tracking per listing

**Order Management**
- Seller order dashboard with status filters
- Order fulfillment and shipment management workflow
- Item-level status updates pushed to customers in real time
- Order chat with buyer

**Analytics & Revenue**
- Revenue and sales analytics dashboard
- Product-level performance metrics
- Payout and transaction tracking
- Seller insights with charts

---

### Admin Features

**Platform Management**
- User management (view, manage)
- Seller approval, rejection, and suspension
- Product moderation (approve/reject seller listings)
- Category management (multi-level hierarchy)
- Brand management

**Homepage Management**
- Dynamic banner creation and ordering
- Featured product configuration
- Deal and lightning deal management
- Section item management (electronics, fashion, furniture rows)
- Shop-by-category and home category customisation
- All changes reflected on the customer homepage without a deployment

**Coupon Management**
- Create, update, and delete coupon codes
- Set discount type (percentage or flat), minimum order value, and expiry

**Analytics & Monitoring**
- Platform-wide revenue reporting
- Seller performance tracking
- Stock sold analytics
- Transaction monitoring

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                       │
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Customer UI │  │   Seller     │  │    Admin     │  │
│  │ React + RTK │  │  Dashboard   │  │    Panel     │  │
│  │ Tailwind    │  │  React + MUI │  │  React +     │  │
│  │ Socket.IO   │  │  Socket.IO   │  │  Context API │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼───────────────-┼─────────────────┼──────────┘
          │  HTTPS + WS    │                 │
┌─────────▼────────────────▼─────────────────▼──────────┐
│                   API GATEWAY LAYER                    │
│                                                        │
│            Express.js — Node.js 20                     │
│   JWT Auth · RBAC · Rate Limiting · Helmet · CORS      │
│   Input Validation · Error Handling · Socket.IO        │
└────────┬──────────────────┬──────────────┬─────────────┘
         │                  │              │
┌────────▼──────┐  ┌────────▼──────┐  ┌───▼────────────┐
│   MongoDB     │  │     Redis     │  │    BullMQ      │
│   Atlas       │  │               │  │   Job Queue    │
│               │  │  - Homepage   │  │                │
│  - Products   │  │  - Products   │  │  - Emails      │
│  - Orders     │  │  - Search     │  │  - Notifs      │
│  - Users      │  │  - Brands     │  │  - Order upd.  │
│  - Reviews    │  │  - Stock lock │  │                │
│  Atlas Search │  │               │  │  Bull Board    │
└───────────────┘  └───────────────┘  └────────────────┘
         │
┌────────▼──────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                     │
│                                                        │
│  Cloudinary CDN  ·  Razorpay  ·  Stripe               │
│  Nodemailer  ·  Gemini AI  ·  MongoDB Atlas Search     │
└────────────────────────────────────────────────────────┘
```

### Request Flow

```
Browser → Vite Dev Server (dev) / Vercel CDN (prod)
       → Express.js API on Render
       → Auth middleware (JWT verify + RBAC check)
       → Cache middleware (Redis lookup)
       → Controller → Service layer
       → MongoDB / Redis / BullMQ
       → Response (cache write if applicable)
       → JSON back to client
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React.js | 19 | UI library |
| TypeScript | 5 | Type safety |
| Vite | 7 | Build tool and dev server |
| Redux Toolkit | 2 | Global state management |
| Material UI (MUI) | 5 | Component library |
| Tailwind CSS | 3 | Utility-first styling |
| React Router | 6 | Client-side routing |
| Axios | 1 | HTTP client |
| Socket.IO Client | 4 | Real-time WebSocket connection |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 | Runtime |
| Express.js | 4 | Web framework |
| MongoDB | 7 | Primary database |
| Mongoose | 8 | ODM / schema management |
| Redis | 7 | Caching and stock locking |
| Socket.IO | 4 | Real-time bidirectional events |
| BullMQ | 5 | Background job queue |
| JWT (jsonwebtoken) | 9 | Authentication tokens |
| bcrypt | — | Password hashing |
| Helmet.js | — | HTTP security headers |
| express-rate-limit | — | API rate limiting |

### Third-Party Services

| Service | Purpose |
|---|---|
| Cloudinary | Image hosting, compression, WebP/AVIF conversion, CDN delivery |
| MongoDB Atlas Search | Full-text search and autocomplete |
| Razorpay | Primary payment gateway |
| Stripe | Alternative payment gateway |
| Nodemailer | Transactional email (OTP, order confirmation) |
| Gemini AI | Shopping assistant chatbot |

### DevOps & Infrastructure

| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting with CDN |
| Render | Backend hosting |
| PM2 | Node.js process management with cluster mode |
| Docker | Containerisation (Dockerfile included) |
| cron-job.org | Keep backend alive on Render free tier |
| Autocannon | Load testing |

---

## Project Structure

```
nexkart/
│
├── frontend/                         # React + TypeScript + Vite
│   ├── public/
│   │   ├── login_banner.png
│   │   ├── seller_banner_image.jpg
│   │   └── stripe_logo.png
│   │
│   └── src/
│       ├── admin/                    # Admin panel
│       │   ├── components/           # DrawerList, ImageUpload
│       │   ├── context/              # AdminThemeContext
│       │   └── pages/
│       │       ├── Analytics/        # Revenue, stock, seller analytics
│       │       ├── Auth/             # AdminLogin
│       │       ├── Brands/           # Brand CRUD
│       │       ├── Coupon/           # Coupon management
│       │       ├── Dashboard/        # KPI overview
│       │       ├── HomePage/         # Banner, deals, sections, categories
│       │       ├── Orders/
│       │       ├── Products/         # Approve/reject listings
│       │       └── Sellers/          # Seller approval table
│       │
│       ├── seller/                   # Seller dashboard
│       │   ├── components/           # Navbar, Sidebar, Demo
│       │   └── pages/
│       │       ├── Account/          # Profile, bank, business, pickup forms
│       │       ├── Orders/           # Order table + fulfillment
│       │       ├── Payment/          # Payouts, transactions
│       │       └── Products/         # My listings, catalog, add product
│       │
│       ├── customer/                 # Customer-facing app
│       │   ├── components/
│       │   │   ├── Footer/
│       │   │   ├── Navbar/           # MegaMenu, CategorySheet, SearchBar
│       │   │   ├── OtpField/
│       │   │   └── Search/           # SmartSearchBar, NavbarSearch
│       │   └── pages/
│       │       ├── Account/          # Orders, tracking, profile, addresses
│       │       ├── Auth/             # Login, signup, forgot password
│       │       ├── Cart/             # Cart, CartItemCard, PricingCard
│       │       ├── ChatBot/          # Gemini AI chatbot UI
│       │       ├── Checkout/         # 3-step checkout flow
│       │       ├── Home/             # All homepage sections
│       │       ├── Products/         # Listing page, detail page, filters
│       │       ├── Review/           # Write and view reviews
│       │       ├── Search/           # Search results page
│       │       └── Wishlist/
│       │
│       ├── Redux Toolkit/
│       │   ├── Admin/                # 9 admin slices
│       │   ├── Customer/             # 14 customer slices (auth, cart, orders…)
│       │   └── Store.ts
│       │
│       ├── routes/                   # Protected route wrappers per role
│       ├── types/                    # 14 TypeScript type definition files
│       └── util/                     # cloudinaryHelpers, razorpay, geolocation
│
└── backend/                          # Node.js + Express + MongoDB
    ├── index.js                      # Entry point, server bootstrap
    ├── Dockerfile
    ├── ecosystem.config.js           # PM2 cluster config
    │
    ├── src/
    │   ├── config/                   # db, redis, cloudinary, socket, security
    │   │
    │   ├── controllers/              # 25 route handlers
    │   │   ├── authController.js
    │   │   ├── orderController.js
    │   │   ├── paymentController.js
    │   │   ├── productController.js
    │   │   ├── sellerController.js
    │   │   ├── ChatboatController.js
    │   │   └── ...
    │   │
    │   ├── services/                 # Business logic layer (26 services)
    │   │   ├── OrderService.js
    │   │   ├── StockLockService.js   # Core concurrency-safe inventory logic
    │   │   ├── SearchService.js      # Atlas Search integration
    │   │   ├── PaymentService.js
    │   │   ├── PaymentServiceV2.js
    │   │   ├── ChatbotService.js
    │   │   └── ...
    │   │
    │   ├── models/                   # 26 Mongoose schemas
    │   │   ├── Product.js
    │   │   ├── ProductListing.js
    │   │   ├── Order.js
    │   │   ├── OrderItem.js
    │   │   ├── Cart.js / CartItem.js
    │   │   ├── Seller.js
    │   │   ├── Transaction.js
    │   │   ├── Tracking.js
    │   │   └── ...
    │   │
    │   ├── middlewares/
    │   │   ├── userAuthMiddleware.js  # JWT verify + user role check
    │   │   ├── sellerAuthMiddleware.js
    │   │   ├── cacheMiddleware.js     # Redis cache read/write wrapper
    │   │   ├── uploadToCloudinary.js  # Multer + Cloudinary pipeline
    │   │   └── reviewRateLimit.js
    │   │
    │   ├── routers/                  # 28 Express route files
    │   ├── queues/                   # BullMQ queue definitions + workers
    │   ├── domain/                   # Enums: OrderStatus, PaymentMethod…
    │   ├── exceptions/               # Typed error classes per domain
    │   ├── utils/                    # JWT provider, OTP generator, email sender
    │   └── validators/               # Input validation (product, etc.)
    │
    └── scripts/                      # Seed scripts, load tests, admin creator
        ├── createAdmin.js
        ├── seedProductsMaster.js
        ├── loadtest-browse.js
        └── loadtest-stock.js
```

---

## Getting Started

### Prerequisites

Make sure the following are installed or available:

- **Node.js** v20 or higher → [nodejs.org](https://nodejs.org)
- **npm** or **pnpm**
- **MongoDB Atlas** account → [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- **Redis** (local or cloud) → [Upstash](https://upstash.com) recommended for cloud
- **Cloudinary** account → [cloudinary.com](https://cloudinary.com)
- **Razorpay** account → [razorpay.com](https://razorpay.com)
- **Google Gemini API key** → [aistudio.google.com](https://aistudio.google.com)

---

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/sidhant0802/Nexkart.git
cd Nexkart
```

#### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables) for all required values):

```bash
cp .env.example .env
# Then fill in all values
```

Seed the database with initial data (optional but recommended for development):

```bash
node createAdmin.js          # Creates the admin account
node seedHomePageData.js     # Seeds homepage sections
node seedProductsMaster.js   # Seeds product catalog
node seedBrandsBig.js        # Seeds brands
```

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Production with PM2 cluster mode
pm2 start ecosystem.config.js
```

The backend will run at `http://localhost:8080`.

#### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Start the dev server:

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

### Default Credentials

#### Admin

```
Email:    admin@nexkart.com
Password: admin123
```

> Create this account by running `node createAdmin.js` in the `backend/` directory.

#### Seller (test account)

Use the Become a Seller flow from the customer UI, or create one via `node setSellerPassword.js`.

#### Razorpay test payments

Use Razorpay test card `4111 1111 1111 1111` with any future expiry and any CVV.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# ── Server ──────────────────────────────────────────────
PORT=8080
NODE_ENV=development

# ── MongoDB ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexkart

# ── JWT ─────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# ── Redis ───────────────────────────────────────────────
# Local Redis
REDIS_URL=redis://localhost:6379
# OR Upstash (recommended for cloud)
# REDIS_URL=rediss://default:<password>@<host>:<port>

# ── Cloudinary ──────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Razorpay ────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ── Stripe (optional) ───────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ── Email (Nodemailer) ──────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# ── Google Gemini AI ────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key

# ── Frontend URL (CORS) ─────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## API Reference

All protected routes require the `Authorization: Bearer <token>` header.

### Health & Public

```
GET  /health                              Server health check
GET  /home-page                           Full homepage data (cached)
GET  /products                            All products (paginated)
GET  /products/:id                        Single product detail
GET  /api/search?q=<query>               Full-text Atlas Search
GET  /api/search/autocomplete?q=<query>  Autocomplete suggestions
GET  /api/brands                          All brands (cached)
GET  /api/categories                      Category tree
```

### Authentication

```
POST  /auth/signup                        Register new user
POST  /auth/signin                        Login with email + password
POST  /auth/send-otp                      Send OTP to email
POST  /auth/verify-otp                    Verify OTP code
POST  /auth/forgot-password               Initiate password reset
POST  /auth/reset-password                Complete password reset
```

### Cart (protected — customer)

```
GET    /api/cart                          Get user's cart
POST   /api/cart/add                      Add item to cart
PUT    /api/cart/item/:id                 Update item quantity
DELETE /api/cart/item/:id                 Remove item from cart
POST   /api/cart/coupon                   Apply coupon code
DELETE /api/cart/coupon                   Remove coupon
```

### Wishlist (protected — customer)

```
GET    /api/wishlist                      Get wishlist
POST   /api/wishlist/:productId           Add product to wishlist
DELETE /api/wishlist/:productId           Remove from wishlist
```

### Orders (protected — customer)

```
POST   /api/orders                        Create a new order
GET    /api/orders/user                   User's order history
GET    /api/orders/:id                    Order detail
POST   /api/orders/:id/return             Initiate return request
GET    /api/tracking/:orderId             Order tracking info
```

### Payments

```
POST   /api/payment/create-order          Create Razorpay order object
POST   /api/payment/verify                Verify payment signature
POST   /api/payment/stripe/create         Create Stripe payment intent
```

### Seller (protected — seller)

```
POST   /sellers/signup                    Seller registration
POST   /sellers/login/password            Seller login
GET    /api/sellers/product               List seller's products
POST   /api/sellers/product               Create new product listing
PUT    /api/sellers/product/:id           Update listing
DELETE /api/sellers/product/:id           Delete listing
GET    /api/seller/orders                 Seller order dashboard
PUT    /api/seller/orders/:id/status      Update order item status
GET    /api/sellers/revenue               Revenue summary
GET    /api/sellers/analytics             Sales analytics
GET    /api/sellers/transactions          Transaction history
GET    /api/sellers/payouts               Payout history
```

### Admin (protected — admin)

```
GET    /api/admin/products                All products with moderation status
PUT    /api/admin/products/:id/approve    Approve product listing
PUT    /api/admin/products/:id/reject     Reject product listing
GET    /api/admin/analytics               Platform analytics
GET    /admin                             Seller management
PUT    /admin/:id/approve                 Approve seller account
PUT    /admin/:id/suspend                 Suspend seller
GET    /admin/deals                       Deal management
POST   /admin/deals                       Create new deal
GET    /admin/banners                     Banner management
POST   /admin/banners                     Create banner
GET    /admin/section-items               Homepage section items
POST   /admin/section-items               Add section item
GET    /admin/home-settings               Homepage configuration
PUT    /admin/home-settings               Update homepage config
GET    /admin/coupon                       Coupon list
POST   /admin/coupon                       Create coupon
DELETE /admin/coupon/:id                  Delete coupon
```

---

## Backend Engineering Deep Dive

### Concurrency-Safe Inventory System

The most critical engineering challenge in any e-commerce platform is **preventing oversells during flash sales** — where thousands of users attempt to buy the same limited-stock item simultaneously.

**The problem:** Without safeguards, two concurrent requests can both read `stock = 1`, both validate "stock > 0", and both decrement — resulting in `stock = -1` and one extra order on zero inventory.

**NexKart's solution combines three layers:**

**Layer 1 — Redis stock locking**
Before any order is processed, `StockLockService` acquires a Redis lock on the product's stock key using `SET NX PX` (set-if-not-exists with expiry). This serializes concurrent writes at the cache layer before they reach MongoDB.

```js
// Simplified StockLockService logic
const lockKey = `stock_lock:${productId}`;
const acquired = await redis.set(lockKey, 'locked', 'NX', 'PX', 5000);
if (!acquired) throw new Error('Stock temporarily unavailable, retry');
```

**Layer 2 — MongoDB atomic conditional update**
Even if the Redis lock were bypassed, the MongoDB write uses a conditional `findOneAndUpdate` that only succeeds if the current stock meets the required quantity:

```js
const result = await ProductListing.findOneAndUpdate(
  { _id: productId, stock: { $gte: quantity } },  // condition
  { $inc: { stock: -quantity } },                  // atomic decrement
  { new: true }
);
if (!result) throw new ProductError('Insufficient stock');
```

**Layer 3 — Purchase validation workflow**
The `OrderService` wraps the entire purchase flow in a try/finally that always releases the Redis lock, even on failure — preventing deadlocks.

**Results:** 2,000+ simultaneous purchase attempts, zero oversold scenarios, 100% inventory integrity.

---

### Redis Caching Layer

Redis is used as a read-through cache for high-traffic, read-heavy endpoints. The `cacheMiddleware` checks for a cached response before hitting the database, and writes the result back to Redis after a successful database read.

**Cached endpoints and TTLs:**

| Endpoint | Cache Key | TTL |
|---|---|---|
| Homepage data | `homepage:data` | 5 minutes |
| Product listings | `products:page:<n>:filters:<hash>` | 2 minutes |
| Product detail | `product:<id>` | 10 minutes |
| Search suggestions | `search:autocomplete:<query>` | 1 minute |
| Brand list | `brands:all` | 30 minutes |

**Cache invalidation** occurs on write operations — when an admin updates the homepage, or a seller edits a product, the relevant cache keys are deleted via `redis.del()`.

---

### MongoDB Atlas Search

Product search uses MongoDB Atlas Search instead of regex queries, providing:

- Full-text search with relevance ranking across `name`, `description`, `brand`, and `category` fields
- Autocomplete suggestions via the `autocomplete` operator on product name
- Fuzzy matching to handle typos
- Compound queries with filter stages for category and price range

The search index is defined in Atlas Search and queries are run through Mongoose's `aggregate()` pipeline.

---

### Async Processing with BullMQ

Long-running or non-critical operations are offloaded to BullMQ workers so API responses remain fast:

| Job type | Trigger | Worker action |
|---|---|---|
| `send-email` | Order placed, OTP request, password reset | Nodemailer sends transactional email |
| `order-notification` | Order status updated | Socket.IO emits to customer room |
| `seller-notification` | New order received | Socket.IO emits to seller room |
| `stock-sync` | Post-purchase | Reconcile stock counts |

The Bull Board dashboard is available for monitoring queue health, job counts, and failed jobs.

---

### Socket.IO Real-Time Layer

Socket.IO manages three types of real-time events:

**Customer events**
- `order:status_updated` — delivery status change
- `notification:new` — new notification (promo, delivery, chat)

**Seller events**
- `order:new` — new order received
- `order:chat_message` — customer message in order chat

**Rooms** are namespaced per user and per order ID, so events are scoped correctly and not broadcast globally.

---

### Security Implementation

| Measure | Implementation |
|---|---|
| Authentication | JWT with `jsonwebtoken`, 7-day expiry, refresh token rotation |
| Password storage | `bcrypt` with salt rounds |
| HTTP headers | `helmet.js` sets X-Frame-Options, CSP, HSTS, etc. |
| Rate limiting | `express-rate-limit` per IP and per endpoint |
| Input validation | Custom validators in `src/validators/` |
| NoSQL injection | Mongoose schema typing prevents raw query injection |
| XSS | Helmet + Content-Security-Policy |
| CORS | Strict origin whitelist via `FRONTEND_URL` env var |
| Payment integrity | Razorpay webhook signature verification |
| Role enforcement | Middleware checks `req.user.role` before every protected route |

---

## Deployment

### Frontend — Vercel

1. Push the repository to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```
5. Click **Deploy**.

### Backend — Render

1. Go to [render.com](https://render.com) → New → Web Service.
2. Connect the GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add all backend environment variables.
7. Click **Create Web Service**.

### Keep the backend alive (free tier)

Render's free tier suspends services after 15 minutes of inactivity. Use [cron-job.org](https://cron-job.org) to ping the health endpoint every 10 minutes:

- URL: `https://your-backend.onrender.com/health`
- Schedule: `*/10 * * * *`

### Docker

A `Dockerfile` is included in the `backend/` directory. To build and run locally:

```bash
cd backend
docker build -t nexkart-backend .
docker run -p 8080:8080 --env-file .env nexkart-backend
```

### PM2 (production process management)

```bash
cd backend
npm install pm2 -g
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The `ecosystem.config.js` is pre-configured for cluster mode, using all available CPU cores.

---

## Load Testing

Load tests are written using [Autocannon](https://github.com/mcollina/autocannon) and are available in the `backend/` root.

```bash
# Browse/search API load test
node loadtest-browse.js

# Concurrent stock purchase test (concurrency-safe inventory)
node loadtest-stock.js

# Quick sanity test
node quick-test.js
```

**Search API results (loadtest-browse.js)**

```
Connections: 500
Duration:    30s
Requests:    ~135,000
Throughput:  ~4,500 req/s
Latency p50: ~100ms
Latency p99: ~280ms
Errors:      0
```

**Inventory stress test results (loadtest-stock.js)**

```
Simultaneous purchase attempts: 2,000
Item stock before test:         1
Successful orders processed:    1
Items oversold:                 0
Inventory integrity:            100%
```

---

## Known Issues

- **Render cold start** — Free tier has a ~50-second cold start after inactivity. Mitigated with cron-job.org ping. Upgrade to a paid Render instance to eliminate.
- **Bundle size** — Frontend bundle is ~2.4 MB uncompressed. Code splitting per route is planned.
- **Image 404 on some categories** — Minor bug where `/2` path returns a 404 for certain category image URLs. Non-blocking; tracked in issues.

---

## Roadmap

- [ ] Dockerised multi-container setup with `docker-compose` (frontend + backend + Redis + MongoDB)
- [ ] CI/CD pipelines via GitHub Actions (lint → test → build → deploy)
- [ ] Kubernetes orchestration for horizontal scaling
- [ ] Unit and integration test coverage (Jest + Supertest)
- [ ] PWA support (service worker, offline mode, install prompt)
- [ ] Search engine migration to Typesense or Meilisearch for lower-latency full-text search
- [ ] Microservice extraction (Order Service, Payment Service, Notification Service)
- [ ] Advanced observability: Prometheus metrics + Grafana dashboard
- [ ] Multi-language support (i18n)
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] AI-powered product recommendations
- [ ] Video product reviews
- [ ] Gift cards and loyalty points system
- [ ] Email marketing automation
- [ ] Subscription-based product listings

---

## Contributing

Contributions are welcome. Please follow these steps:

1. **Fork** the repository.
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the coding standards below.
4. **Test locally** — run the dev servers and verify your change.
5. **Commit** with a meaningful message:
   ```bash
   git commit -m "feat: add return request email notification"
   ```
6. **Push** your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against `main` with a clear description of what you changed and why.

### Coding standards

- TypeScript is required for all frontend code.
- Follow ESLint rules (config is in `eslint.config.js`).
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Write meaningful comments for non-obvious logic, especially in the service layer.
- Test edge cases manually (empty cart, zero stock, invalid coupon, expired token) before submitting.
- Do not commit `.env` files, secrets, or `node_modules`.

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Sidhant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## Author

**Sidhant Nirupam**

- GitHub: [@sidhant0802](https://github.com/sidhant0802)
- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/sidhant-nirupam-a1988431a/)
- Email: your.email@example.com

---

## Acknowledgements

- Inspired by [Amazon](https://amazon.com) and [Flipkart](https://flipkart.com)
- UI components from [Material UI](https://mui.com)
- Icons from [React Icons](https://react-icons.github.io/react-icons)
- Frontend hosted on [Vercel](https://vercel.com)
- Backend hosted on [Render](https://render.com)
- Database by [MongoDB Atlas](https://mongodb.com/atlas)
- Special thanks to the open-source community

---

<div align="center">

**If this project was useful to you, please give it a ⭐ on GitHub.**

Made with care by Sidhant · [Back to top](#nexkart)

</div>
