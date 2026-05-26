const Product        = require("../models/Product");
const ProductListing = require("../models/ProductListing");
const Order          = require("../models/Order");
const OrderItem      = require("../models/OrderItem");
const User           = require("../models/User");
const Seller         = require("../models/Seller");
const Cart           = require("../models/Cart");
const Wishlist       = require("../models/Wishlist");
const Review         = require("../models/Review");

// ✅ Create indexes on server start (idempotent — safe to run many times)
const createIndexes = async () => {
  try {
    console.log("📊 Creating MongoDB indexes...");

    // ── Product indexes ──
    await Product.collection.createIndex({ brand: 1, category: 1 });
    await Product.collection.createIndex({ minPrice: 1 });
    await Product.collection.createIndex({ isActive: 1, createdAt: -1 });
    await Product.collection.createIndex({ title: "text", description: "text", brand: "text" });

    // ── ProductListing indexes ──
    await ProductListing.collection.createIndex({ product: 1, sellingPrice: 1 });
    await ProductListing.collection.createIndex({ seller: 1, isActive: 1 });
    await ProductListing.collection.createIndex({ isActive: 1, sellingPrice: 1 });

    // ── Order indexes ──
    await Order.collection.createIndex({ user: 1, createdAt: -1 });
    await Order.collection.createIndex({ seller: 1, orderStatus: 1 });
    await Order.collection.createIndex({ seller: 1, createdAt: -1 });
    await Order.collection.createIndex({ orderStatus: 1, createdAt: -1 });
    await Order.collection.createIndex({ razorpayOrderId: 1 });

    // ── OrderItem indexes ──
    await OrderItem.collection.createIndex({ product: 1, seller: 1 });
    await OrderItem.collection.createIndex({ seller: 1, createdAt: -1 });
    await OrderItem.collection.createIndex({ createdAt: -1 });

    // ── User indexes ──
    await User.collection.createIndex({ email: 1 }, { unique: true });
const Brand = require("../models/Brand");
await Brand.collection.createIndex({ isActive: 1, featured: -1, name: 1 });
await Brand.collection.createIndex({ slug: 1 }, { unique: true });

    // ── Seller indexes ──
    await Seller.collection.createIndex({ email: 1 }, { unique: true });
    await Seller.collection.createIndex({ accountStatus: 1, createdAt: -1 });
await Product.collection.createIndex({ brand: 1, isActive: 1 });
    // ── Cart & Wishlist ──
    await Cart.collection.createIndex({ user: 1 }, { unique: true });
    await Wishlist.collection.createIndex({ user: 1 }, { unique: true });

    // ── Review indexes ──
    await Review.collection.createIndex({ product: 1, createdAt: -1 });
    await Review.collection.createIndex({ user: 1 });

    console.log("✅ MongoDB indexes created successfully");
  } catch (err) {
    console.error("❌ Index creation error:", err.message);
  }
};

module.exports = { createIndexes };