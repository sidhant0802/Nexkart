const { Worker }       = require("bullmq");
const { connection }   = require("../queueConfig");
const { sendVerificationEmail } = require("../../utils/sendEmail");

// ══════════════════════════════════════════════════════
// EMAIL JOB PROCESSOR
// ══════════════════════════════════════════════════════

const emailWorker = new Worker(
  "email",
  async (job) => {
    const { type, to, subject, text, html, data } = job.data;

    console.log(`📧 Processing email job [${type}] → ${to}`);

    try {
      switch (type) {

        // ── OTP Email ──
        case "send-otp":
          await sendVerificationEmail(
            to,
            "Nexkart Verification Code",
            `Your OTP is: ${data.otp}\n\nValid for 10 minutes.`
          );
          break;

        // ── Order Confirmation ──
        case "order-confirmation":
          await sendVerificationEmail(
            to,
            `Order Confirmed - #${data.orderId}`,
            `Hi ${data.userName},\n\nYour order has been confirmed!\n\nOrder ID: ${data.orderId}\nTotal: ₹${data.total}\n\nWe'll notify you when it ships.\n\nThank you for shopping with Nexkart!`
          );
          break;

        // ── Order Shipped ──
        case "order-shipped":
          await sendVerificationEmail(
            to,
            `Your order has shipped! - #${data.orderId}`,
            `Hi ${data.userName},\n\nGreat news! Your order is on the way.\n\nTracking: ${data.trackingId || "Coming soon"}\nExpected delivery: ${data.deliveryDate}\n\nThank you!`
          );
          break;

        // ── Order Delivered ──
        case "order-delivered":
          await sendVerificationEmail(
            to,
            `Order Delivered - #${data.orderId}`,
            `Hi ${data.userName},\n\nYour order has been delivered.\n\nWe'd love your feedback! Please leave a review.\n\nThank you for shopping with Nexkart!`
          );
          break;

        // ── Seller Welcome ──
        case "seller-welcome":
          await sendVerificationEmail(
            to,
            "Welcome to Nexkart Seller Program",
            `Hi ${data.sellerName},\n\nWelcome aboard! Your seller account has been created.\n\nVerification OTP: ${data.otp}\n\nVisit your dashboard: https://nexkart.com/seller`
          );
          break;

        // ── Seller Approved ──
        case "seller-approved":
          await sendVerificationEmail(
            to,
            "🎉 Your Seller Account is Approved!",
            `Hi ${data.sellerName},\n\nCongratulations! Your seller account has been approved.\n\nYou can now start listing products on Nexkart.\n\nGo to dashboard: https://nexkart.com/seller`
          );
          break;

        // ── Password Reset ──
        case "password-reset":
          await sendVerificationEmail(
            to,
            "Reset Your Password",
            `Hi,\n\nClick the link to reset your password:\n${data.resetLink}\n\nThis link expires in 1 hour.`
          );
          break;

        // ── Abandoned Cart ──
        case "abandoned-cart":
          await sendVerificationEmail(
            to,
            "You left items in your cart! 🛒",
            `Hi ${data.userName},\n\nYou have ${data.itemCount} item(s) waiting in your cart.\n\nComplete your purchase: https://nexkart.com/cart\n\n${data.coupon ? `Use code ${data.coupon} for 10% off!` : ""}`
          );
          break;

        // ── Generic / Custom ──
        default:
          await sendVerificationEmail(to, subject, text);
          break;
      }

      return { success: true, sentTo: to };

    } catch (err) {
      console.error(`❌ Email job failed [${type}] → ${to}:`, err.message);
      throw err;  // Let BullMQ retry
    }
  },
  {
    connection,
    concurrency: 5,              // Process 5 emails at once
    limiter: {
      max:      10,              // Max 10 emails
      duration: 1000,            // per second (avoid email rate limits)
    },
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Email sent [${job.data.type}] → ${job.data.to}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email failed [${job.data.type}]: ${err.message}`);
});

module.exports = emailWorker;