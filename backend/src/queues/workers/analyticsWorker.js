const { Worker }     = require("bullmq");
const { connection } = require("../queueConfig");

// ══════════════════════════════════════════════════════
// ANALYTICS WORKER (fire and forget tracking)
// ══════════════════════════════════════════════════════

const analyticsWorker = new Worker(
  "analytics",
  async (job) => {
    const { event, userId, sessionId, data, timestamp } = job.data;

    try {
      // ── Track different event types ──
      switch (event) {

        case "page-view":
          console.log(`📊 Page view: ${data.page} by ${userId || "anonymous"}`);
          // TODO: Insert into analytics DB / send to PostHog
          break;

        case "product-view":
          console.log(`📊 Product viewed: ${data.productId}`);
          // Update view count, recommendation engine, etc.
          break;

        case "add-to-cart":
          console.log(`📊 Add to cart: ${data.productId} by ${userId}`);
          break;

        case "checkout-started":
          console.log(`📊 Checkout started by ${userId}: ₹${data.total}`);
          break;

        case "order-placed":
          console.log(`📊 Order placed: ${data.orderId} ₹${data.total}`);
          break;

        case "search":
          console.log(`📊 Search: "${data.query}" by ${userId || "anonymous"}`);
          break;

        case "filter-applied":
          console.log(`📊 Filter: ${JSON.stringify(data.filters)}`);
          break;

        default:
          console.log(`📊 Event: ${event}`);
      }

      return { tracked: true };

    } catch (err) {
      // Analytics shouldn't break the app — just log
      console.error("Analytics worker error:", err.message);
      return { tracked: false, error: err.message };
    }
  },
  {
    connection,
    concurrency: 20,             // High concurrency for analytics
  }
);

module.exports = analyticsWorker;