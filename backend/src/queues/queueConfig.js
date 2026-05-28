const { Queue, Worker, QueueEvents } = require("bullmq");
const Redis = require("ioredis");

// ✅ Create Redis connection for BullMQ
// (Separate connection — BullMQ requires maxRetriesPerRequest=null)
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});

connection.on("connect", () => {
  console.log("✅ BullMQ Redis connected");
});

connection.on("error", (err) => {
  console.error("❌ BullMQ Redis error:", err.message);
});

// ══════════════════════════════════════════════════════
// QUEUE DEFINITIONS
// ══════════════════════════════════════════════════════

// 📧 Email queue
const emailQueue = new Queue("email", {
  connection,
  defaultJobOptions: {
    attempts: 3,                  // Retry 3 times if fails
    backoff: {
      type: "exponential",
      delay: 2000,                // 2s, 4s, 8s
    },
    removeOnComplete: { count: 100 },   // Keep last 100 completed
    removeOnFail:     { count: 500 },   // Keep last 500 failed
  },
});

// 🔔 Notification queue
const notificationQueue = new Queue("notification", {
  connection,
  defaultJobOptions: {
    attempts:         3,
    backoff:          { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 50  },
    removeOnFail:     { count: 100 },
  },
});

// 📊 Analytics queue (fire and forget)
const analyticsQueue = new Queue("analytics", {
  connection,
  defaultJobOptions: {
    attempts:         1,           // Don't retry analytics
    removeOnComplete: { count: 20 },
    removeOnFail:     { count: 50 },
  },
});

// 🛒 Cart abandonment reminders
const abandonedCartQueue = new Queue("abandoned-cart", {
  connection,
  defaultJobOptions: {
    attempts:         2,
    removeOnComplete: { count: 50 },
    removeOnFail:     { count: 100 },
  },
});

// ══════════════════════════════════════════════════════
// QUEUE EVENTS (for monitoring)
// ══════════════════════════════════════════════════════

const setupQueueEvents = (queueName) => {
  const events = new QueueEvents(queueName, { connection });

  events.on("completed", ({ jobId }) => {
    console.log(`✅ Job ${jobId} completed [${queueName}]`);
  });

  events.on("failed", ({ jobId, failedReason }) => {
    console.error(`❌ Job ${jobId} failed [${queueName}]: ${failedReason}`);
  });

  return events;
};

module.exports = {
  connection,
  emailQueue,
  notificationQueue,
  analyticsQueue,
  abandonedCartQueue,
  setupQueueEvents,
};