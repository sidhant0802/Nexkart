const OrderService = require("../services/OrderService");
const CartService  = require("../services/CartService");
const OrderError   = require("../exceptions/OrderError");
const PaymentMethod = require("../domain/PaymentMethod");
const PaymentService = require("../services/PaymentService");
const PaymentOrder = require("../models/PaymentOrder");

class OrderController {
  async createOrder(req, res, next) {
    const { shippingAddress } = req.body;
    const { paymentMethod } = req.query;

    try {
      const user = req.user;
      const cart = await CartService.findUserCart(user);
      const orders = await OrderService.createOrder(user, shippingAddress, cart);
      const paymentOrder = await PaymentService.createOrder(user, orders);
      const response = {};

      if (paymentMethod === PaymentMethod.RAZORPAY) {
        const payment = await PaymentService.createRazorpayPaymentLink(
          user, paymentOrder.amount, paymentOrder._id
        );
        response.payment_link_url = payment.short_url;
        paymentOrder.paymentLinkId = payment.id;
        await PaymentOrder.findByIdAndUpdate(paymentOrder._id, paymentOrder);
      } else if (paymentMethod === PaymentMethod.STRIPE) {
        const paymentUrl = await PaymentService.createStripePaymentLink(
          user, paymentOrder.amount, paymentOrder._id
        );
        response.payment_link_url = paymentUrl;
      }

      return res.status(200).json(response);
    } catch (error) {
      console.log("createOrder error:", error);
      return res.status(500).json({ message: `Error creating order: ${error.message}` });
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params;
      console.log("🔍 getOrderById:", orderId);
      const order = await OrderService.findOrderById(orderId);
      return res.status(200).json(order);
    } catch (error) {
      console.log("❌ getOrderById error:", error.message);
      if (error.message?.toLowerCase().includes("invalid") ||
          error.message?.toLowerCase().includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async getOrderItemById(req, res, next) {
    try {
      const { orderItemId } = req.params;
      console.log("🔍 getOrderItemById:", orderItemId);
      const orderItem = await OrderService.findOrderItemById(orderItemId);
      return res.status(200).json(orderItem);
    } catch (error) {
      console.log("❌ getOrderItemById error:", error.message);
      if (error.message?.toLowerCase().includes("invalid") ||
          error.message?.toLowerCase().includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // ✅ CORRECT name matching orderRoutes.js
  async getUserOrderHistory(req, res) {
    try {
      const userId = req.user._id;
      console.log("📋 getUserOrderHistory for:", userId);
      const orderHistory = await OrderService.usersOrderHistory(userId);
      console.log("✅ orders found:", orderHistory.length);
      return res.status(200).json(orderHistory);
    } catch (error) {
      console.log("❌ getUserOrderHistory error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  async getSellersOrders(req, res) {
    try {
      const sellerId = req.seller._id;
      const orders = await OrderService.getShopsOrders(sellerId);
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { orderId, orderStatus } = req.params;
      const updatedOrder = await OrderService.updateOrderStatus(orderId, orderStatus);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;
      const canceledOrder = await OrderService.cancelOrder(orderId, userId);
      return res.status(200).json({
        message: "Order cancelled successfully",
        order: canceledOrder,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      await OrderService.deleteOrder(orderId);
      return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();