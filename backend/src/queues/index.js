// ══════════════════════════════════════════════════════
// START ALL WORKERS
// ══════════════════════════════════════════════════════

const startWorkers = () => {
  try {
    require("./workers/emailWorker");
    require("./workers/notificationWorker");
    require("./workers/analyticsWorker");

    console.log("✅ All BullMQ workers started:");
    console.log("   📧 Email worker     (concurrency: 5)");
    console.log("   🔔 Notification worker (concurrency: 10)");
    console.log("   📊 Analytics worker (concurrency: 20)");
  } catch (err) {
    console.error("❌ Failed to start workers:", err.message);
  }
};

module.exports = { startWorkers };