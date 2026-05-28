const { Worker }     = require("bullmq");
const { connection } = require("../queueConfig");
const {
  emitToAdmin,
  emitToSeller,
  emitToUser,
} = require("../../config/socket");

// ══════════════════════════════════════════════════════
// NOTIFICATION WORKER (with real-time Socket.IO emit!)
// ══════════════════════════════════════════════════════

const notificationWorker = new Worker(
  "notification",
  async (job) => {
    const { type, userId, sellerId, data } = job.data;

    console.log(`🔔 Processing notification [${type}]`);

    try {
      switch (type) {

        // ── New Seller → notify admin in real-time ──
        case "new-seller":
          emitToAdmin("notification:new-seller", {
            id:         Date.now(),
            type:       "new-seller",
            title:      "🆕 New Seller Registered",
            message:    `${data.sellerName} just signed up`,
            sellerId:   data.sellerId,
            sellerName: data.sellerName,
            email:      data.email,
            timestamp:  new Date(),
          });
          break;

        // ── New Order → notify seller ──
        case "new-order":
          emitToSeller(sellerId, "notification:new-order", {
            id:        Date.now(),
            type:      "new-order",
            title:     "📦 New Order Received!",
            message:   `Order #${data.orderId} - ₹${data.total}`,
            orderId:   data.orderId,
            items:     data.items,
            total:     data.total,
            timestamp: new Date(),
          });
          break;

        // ── Order status → notify customer ──
        case "order-status":
          emitToUser(userId, "notification:order-status", {
            id:        Date.now(),
            type:      "order-status",
            title:     `📦 Order ${data.status}`,
            orderId:   data.orderId,
            status:    data.status,
            timestamp: new Date(),
          });
          break;

        // ── Low stock → notify seller ──
        case "low-stock":
          emitToSeller(sellerId, "notification:low-stock", {
            id:          Date.now(),
            type:        "low-stock",
            title:       "⚠️ Low Stock Alert",
            message:     `${data.productName} has only ${data.quantity} left`,
            productId:   data.productId,
            quantity:    data.quantity,
            productName: data.productName,
            timestamp:   new Date(),
          });
          break;

        // ── Review → notify seller ──
        case "new-review":
          emitToSeller(sellerId, "notification:new-review", {
            id:          Date.now(),
            type:        "new-review",
            title:       `⭐ New ${data.rating}-Star Review`,
            message:     `On ${data.productName}`,
            rating:      data.rating,
            productName: data.productName,
            timestamp:   new Date(),
          });
          break;

        default:
          console.log(`Unknown notification type: ${type}`);
      }

      return { success: true };

    } catch (err) {
      console.error(`❌ Notification failed [${type}]:`, err.message);
      throw err;
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`✅ Notification sent [${job.data.type}]`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ Notification failed [${job.data.type}]: ${err.message}`);
});

module.exports = notificationWorker;