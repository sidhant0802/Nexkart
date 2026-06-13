// backend/src/services/PaymentServiceV2.js
const crypto         = require("crypto");
const razorpay       = require("../config/razorpayClient");
const Order          = require("../models/Order");
const Cart           = require("../models/Cart");
const OrderStatus    = require("../domain/OrderStatus");
const PaymentStatus  = require("../domain/PaymentStatus");
const StockLockService = require("./StockLockService");
const CheckoutService  = require("./CheckoutService");
const { getCache, setCache, deleteCache } = require("../config/redis");

class PaymentServiceV2 {

  // ── Create Razorpay order for a Nexkart order ──
  async createRazorpayOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.orderStatus !== OrderStatus.PAYMENT_PENDING) {
      throw new Error("Order is not in payment-pending state");
    }

    // ✅ IDEMPOTENCY: If Razorpay order already exists for this Nexkart order, reuse it
    if (order.razorpayOrderId) {
      console.log(`⚡ Reusing existing Razorpay order: ${order.razorpayOrderId}`);
      return {
        razorpayOrderId: order.razorpayOrderId,
        amount:          Math.round(order.totalSellingPrice * 100),
        currency:        "INR",
        key:             process.env.RAZORPAY_KEY_ID,
        nexkartOrderId:  orderId,
        reused:          true,
      };
    }

    const razorpayOrder = await razorpay.orders.create({
      amount:   Math.round(order.totalSellingPrice * 100),
      currency: "INR",
      receipt:  `order_${orderId}`,
      notes: {
        nexkartOrderId: orderId.toString(),
        userId:         order.user.toString(),
      },
    });

    // Store razorpay order id in Nexkart order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return {
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      key:             process.env.RAZORPAY_KEY_ID,
      nexkartOrderId:  orderId,
    };
  }

  // ── Verify payment signature & confirm order (IDEMPOTENT) ──
  async verifyAndConfirm({ razorpayOrderId, razorpayPaymentId, razorpaySignature, nexkartOrderId }) {

    // ══════════════════════════════════════════════════════════════
    // ✅ IDEMPOTENCY CHECK #1 — Redis cache (prevents 2 simultaneous calls)
    // ══════════════════════════════════════════════════════════════
    const cacheKey = `payment:verify:${razorpayPaymentId}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      console.log(`⚡ Payment ${razorpayPaymentId} already processed (cache hit)`);
      return cached;
    }

    // ══════════════════════════════════════════════════════════════
    // ✅ Step 1: Verify HMAC signature
    // ══════════════════════════════════════════════════════════════
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpaySignature) {
      console.error(`❌ Invalid signature for payment ${razorpayPaymentId}`);
      throw new Error("Invalid payment signature");
    }

    // ══════════════════════════════════════════════════════════════
    // ✅ Step 2: Load order
    // ══════════════════════════════════════════════════════════════
    const order = await Order.findById(nexkartOrderId);
    if (!order) throw new Error("Order not found");

    if (order.razorpayOrderId !== razorpayOrderId) {
      throw new Error("Order ID mismatch");
    }

    // ══════════════════════════════════════════════════════════════
    // ✅ IDEMPOTENCY CHECK #2 — DB-level (definitive truth)
    // ══════════════════════════════════════════════════════════════
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      console.log(`⚡ Order ${nexkartOrderId} already COMPLETED — no double-process`);

      // Cache it for 1 hour so future duplicate calls don't even hit DB
      await setCache(cacheKey, order, 3600);
      return order;
    }

    // ══════════════════════════════════════════════════════════════
    // ✅ Step 3: Atomic update — only if still PENDING
    // (prevents two concurrent webhook calls from both succeeding)
    // ══════════════════════════════════════════════════════════════
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id:           nexkartOrderId,
        paymentStatus: PaymentStatus.PENDING,        // ⭐ conditional
      },
      {
        paymentStatus:     PaymentStatus.COMPLETED,
        razorpayPaymentId: razorpayPaymentId,
        orderStatus:       OrderStatus.CONFIRMED,
        paidAt:            new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      // Someone else already confirmed it between our check and update
      const currentOrder = await Order.findById(nexkartOrderId);
      console.log(`⚡ Order was confirmed concurrently — returning current state`);
      await setCache(cacheKey, currentOrder, 3600);
      return currentOrder;
    }

    // ══════════════════════════════════════════════════════════════
    // ✅ Step 4: Clear cart + cache result
    // ══════════════════════════════════════════════════════════════
    await Cart.findOneAndUpdate(
      { user: order.user },
      { cartItems: [] }
    );

    // Cache for idempotency (1 hour)
    await setCache(cacheKey, updatedOrder, 3600);

    console.log(`✅ Payment confirmed: ${razorpayPaymentId} for order ${nexkartOrderId}`);
    return updatedOrder;
  }

  // ── Payment failed/cancelled → release stock ──
  async handlePaymentFailure(orderId) {
    const cacheKey = `payment:failure:${orderId}`;
    const cached   = await getCache(cacheKey);
    if (cached) return cached;

    const result = await CheckoutService.releaseOrderStock(orderId);

    await setCache(cacheKey, result, 3600);
    return result;
  }
}

module.exports = new PaymentServiceV2();