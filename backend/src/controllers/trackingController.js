const TrackingService = require("../services/TrackingService");
const Order           = require("../models/Order");

class TrackingController {

  // GET /api/tracking/:orderId
  async getTracking(req, res) {
    try {
      const tracking = await TrackingService.getByOrderId(req.params.orderId);
      return res.status(200).json(tracking);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  // PUT /api/tracking/:orderId/status — Seller updates status
  async updateStatus(req, res) {
    try {
      const { status, message, location, estimatedDelivery, carrier, trackingNumber } = req.body;

      // Verify seller owns this order
      const order = await Order.findById(req.params.orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.seller.toString() !== req.seller._id.toString()) {
        return res.status(403).json({ message: "Not your order" });
      }

      // Update tracking
      const tracking = await TrackingService.updateStatus(
        req.params.orderId,
        status,
        message,
        location
      );

      // Update order status too
      order.orderStatus = status;
      if (status === "DELIVERED") order.deliverDate = new Date();
      await order.save();

      // Update extras if provided
      if (estimatedDelivery) {
        await TrackingService.updateEstimatedDelivery(req.params.orderId, estimatedDelivery);
      }
      if (carrier || trackingNumber) {
        await TrackingService.updateCarrier(
          req.params.orderId,
          carrier || tracking.carrier,
          trackingNumber || tracking.trackingNumber
        );
      }

      const updated = await TrackingService.getByOrderId(req.params.orderId);
      return res.status(200).json({ success: true, tracking: updated, order });

    } catch (err) {
      console.error("updateStatus error:", err);
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new TrackingController();