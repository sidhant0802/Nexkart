// backend/src/services/StockLockService.js
const ProductListing = require("../models/ProductListing");
const Product        = require("../models/Product");
const Redis          = require("ioredis");
const Redlock        = require("redlock").default;

// ✅ Optional Redlock (for multi-server deployments)
let redlock = null;
let useRedlock = false;

try {
  const redisLockClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck:     false,
  });

  redlock = new Redlock([redisLockClient], {
    driftFactor:    0.01,
    retryCount:     20,
    retryDelay:     150,
    retryJitter:    50,
    automaticExtensionThreshold: 500,
  });

  redlock.on("error", (err) => {
    if (err.name === "ResourceLockedError") return;
  });

  // ✅ Enable Redlock only if explicitly set in env
  useRedlock = process.env.USE_REDLOCK === "true";
} catch (err) {
  console.warn("⚠️  Redlock disabled (Redis unavailable)");
}

class StockLockService {

  /**
   * 🔒 ATOMIC stock decrement
   *
   * Primary: MongoDB findOneAndUpdate with $gte conditional update
   *   - Guaranteed atomic at DB level (no race condition possible)
   *   - Very fast (no extra network hop)
   *
   * Optional: Redlock distributed lock (for multi-server clusters)
   *   - Only enable with USE_REDLOCK=true env var
   *   - Adds 50-200ms latency but prevents lock contention across servers
   */
  async lockStock(listingId, quantity, session = null) {
    if (useRedlock && redlock) {
      return await this._lockStockWithRedlock(listingId, quantity, session);
    }
    return await this._lockStockAtomicOnly(listingId, quantity, session);
  }

  // ✅ Fast path — MongoDB atomic only (recommended for single-instance)
  async _lockStockAtomicOnly(listingId, quantity, session = null) {
    const opts = session ? { session, new: true } : { new: true };

    const listing = await ProductListing.findOneAndUpdate(
      {
        _id:      listingId,
        isActive: true,
        quantity: { $gte: quantity },
      },
      { $inc: { quantity: -quantity } },
      opts
    );

    if (!listing) {
      const exists = await (session
        ? ProductListing.findById(listingId).session(session)
        : ProductListing.findById(listingId));

      if (!exists) throw new Error(`Listing ${listingId} not found`);
      if (!exists.isActive) throw new Error(`Product is no longer available`);
      throw new Error(`Out of stock — only ${exists.quantity} units available`);
    }

    return listing;
  }

  // ✅ Safe path — with Redlock (for multi-server deployments)
  async _lockStockWithRedlock(listingId, quantity, session = null) {
    const lockKey = `lock:stock:${listingId}`;
    let lock;

    try {
      lock = await redlock.acquire([lockKey], 5000);
      return await this._lockStockAtomicOnly(listingId, quantity, session);
    } finally {
      if (lock) {
        try { await lock.release(); } catch (e) {}
      }
    }
  }

  /**
   * 🔓 Release locked stock
   */
  async releaseStock(listingId, quantity, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await ProductListing.findByIdAndUpdate(
      listingId,
      { $inc: { quantity: quantity } },
      opts
    );
  }

  /**
   * 🔒 Batch lock multiple listings (with auto-rollback)
   */
  async lockMultipleStocks(items, session = null) {
    const locked = [];

    try {
      for (const item of items) {
        const result = await this.lockStock(item.listingId, item.quantity, session);
        locked.push({
          listingId: item.listingId,
          quantity:  item.quantity,
          listing:   result,
        });
      }
      return locked;
    } catch (err) {
      // ✅ Rollback any locks acquired so far
      console.error("Batch lock failed, rolling back:", err.message);
      for (const item of locked) {
        try {
          await this.releaseStock(item.listingId, item.quantity, session);
        } catch (e) {}
      }
      throw err;
    }
  }

  async markAsSold(listingId, quantity, session = null) {
    const opts = session ? { session } : {};
    await ProductListing.findByIdAndUpdate(
      listingId,
      { $inc: { totalSold: quantity } },
      opts
    );
  }

  async syncProductStock(productId, session = null) {
    const findOpts = session ? { session } : {};
    const listings = await ProductListing.find(
      { product: productId, isActive: true },
      null,
      findOpts
    );

    const totalStock = listings.reduce((sum, l) => sum + l.quantity, 0);

    const updateOpts = session ? { session } : {};
    await Product.findByIdAndUpdate(productId, { totalStock }, updateOpts);
  }

  async getStock(listingId) {
    const listing = await ProductListing.findById(listingId).select("quantity isActive");
    return {
      quantity: listing?.quantity || 0,
      isActive: listing?.isActive || false,
    };
  }
}

module.exports = new StockLockService();