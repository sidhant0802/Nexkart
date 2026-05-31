// backend/src/controllers/checkoutController.js
const CheckoutService  = require("../services/CheckoutService");
const PaymentServiceV2 = require("../services/PaymentServiceV2");
const Seller           = require("../models/Seller");
const PaymentMethod    = require("../domain/PaymentMethod");

class CheckoutController {

  // POST /api/checkout/buy-now
  async buyNow(req, res) {
    try {
      const user = req.user;
      const { listingId, quantity, shippingAddress, paymentMethod } = req.body;

      console.log("buyNow body:", JSON.stringify({
        listingId, quantity, paymentMethod,
        hasAddress: !!shippingAddress,
        user: user?.email
      }));

      if (!listingId)       return res.status(400).json({ success: false, message: "listingId is required" });
      if (!quantity)        return res.status(400).json({ success: false, message: "quantity is required" });
      if (!shippingAddress) return res.status(400).json({ success: false, message: "shippingAddress is required" });
      if (!paymentMethod)   return res.status(400).json({ success: false, message: "paymentMethod is required" });

      const order = await CheckoutService.buyNow({
        user,
        listingId,
        quantity:      Number(quantity),
        shippingAddress,
        paymentMethod,
      });

      if (paymentMethod === PaymentMethod.COD) {
        return res.status(201).json({
          success:       true,
          paymentMethod: "COD",
          order,
          orders:        [order],
          message:       "Order placed! Pay on delivery.",
        });
      }

      const razorpay = await PaymentServiceV2.createRazorpayOrder(order._id);

      return res.status(201).json({
        success:        true,
        paymentMethod:  "RAZORPAY",
        order,
        orders:         [order],
        razorpay,
        razorpayOrders: [razorpay],
      });

    } catch (err) {
      console.error("buyNow error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/checkout/cart
  async checkoutCart(req, res) {
    try {
      const user = req.user;
      const { shippingAddress, paymentMethod } = req.body;

      console.log("checkoutCart body:", JSON.stringify({
        paymentMethod, hasAddress: !!shippingAddress, user: user?.email
      }));

      if (!shippingAddress) return res.status(400).json({ success: false, message: "shippingAddress is required" });
      if (!paymentMethod)   return res.status(400).json({ success: false, message: "paymentMethod is required" });

      const orders = await CheckoutService.checkoutCart({
        user, shippingAddress, paymentMethod,
      });

      if (paymentMethod === PaymentMethod.COD) {
        return res.status(201).json({
          success:       true,
          paymentMethod: "COD",
          orders,
          order:         orders[0],
          message:       "Orders placed! Pay on delivery.",
        });
      }

      const razorpayOrders = [];
      for (const order of orders) {
        const rp = await PaymentServiceV2.createRazorpayOrder(order._id);
        razorpayOrders.push(rp);
      }

      return res.status(201).json({
        success:        true,
        paymentMethod:  "RAZORPAY",
        orders,
        order:          orders[0],
        razorpayOrders,
        razorpay:       razorpayOrders[0],
        totalAmount:    orders.reduce((s, o) => s + o.totalSellingPrice, 0),
      });

    } catch (err) {
      console.error("checkoutCart error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/checkout/verify-payment
  async verifyPayment(req, res) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, nexkartOrderId } = req.body;

      const order = await PaymentServiceV2.verifyAndConfirm({
        razorpayOrderId, razorpayPaymentId, razorpaySignature, nexkartOrderId,
      });

      return res.status(200).json({ success: true, order, message: "Payment verified!" });

    } catch (err) {
      console.error("verifyPayment error:", err.message);
      if (req.body?.nexkartOrderId) {
        try { await PaymentServiceV2.handlePaymentFailure(req.body.nexkartOrderId); }
        catch (e) { console.error("Stock release error:", e.message); }
      }
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/checkout/payment-failed
  async paymentFailed(req, res) {
    try {
      const { nexkartOrderId } = req.body;
      if (!nexkartOrderId) return res.status(400).json({ success: false, message: "nexkartOrderId required" });
      const order = await PaymentServiceV2.handlePaymentFailure(nexkartOrderId);
      return res.status(200).json({ success: true, order });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // GET /api/checkout/seller-payment-options/:sellerId
  async getSellerPaymentOptions(req, res) {
    try {
      const seller = await Seller.findById(req.params.sellerId);

      // ✅ Never 404 - return safe defaults so COD check doesn't crash
      return res.status(200).json({
        razorpayEnabled: true,
        codEnabled:      seller?.codEnabled  ?? false,
        codMaxAmount:    seller?.codMaxAmount ?? 5000,
        sellerName:      seller?.sellerName  ?? "Store",
      });
    } catch (err) {
      return res.status(200).json({
        razorpayEnabled: true,
        codEnabled:      false,
        codMaxAmount:    0,
        sellerName:      "Store",
      });
    }
  }
}

module.exports = new CheckoutController();