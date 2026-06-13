const Tracking = require("../models/Tracking");
const Order    = require("../models/Order");
const Seller   = require("../models/Seller");
const Address  = require("../models/Address");

const STATUS_MESSAGES = {
  ORDER_PLACED:     { desc: "Order placed successfully",         location: "Order received" },
  CONFIRMED:        { desc: "Seller confirmed your order",       location: "Seller warehouse" },
  PACKED:           { desc: "Item packed and ready for dispatch", location: "Dispatch center" },
  SHIPPED:          { desc: "Package shipped from warehouse",    location: "In transit" },
  OUT_FOR_DELIVERY: { desc: "Out for delivery — arriving today", location: "Local delivery hub" },
  DELIVERED:        { desc: "Delivered successfully",            location: "Delivered" },
  CANCELLED:        { desc: "Order cancelled",                   location: "—" },
};

// ✅ Days to add based on current status (smart ETA)
const STATUS_DELIVERY_DAYS = {
  ORDER_PLACED:     7,
  CONFIRMED:        6,
  PACKED:           4,
  SHIPPED:          3,
  OUT_FOR_DELIVERY: 1,
  DELIVERED:        0,
  CANCELLED:        0,
};

// ✅ Inter-state delivery days estimate
const INTER_STATE_DAYS = {
  same:     2,   // same city/state
  near:     4,   // neighboring states
  far:      7,   // far states
  default:  5,
};

const NEAR_STATES = {
  "Bihar":       ["Jharkhand", "West Bengal", "Uttar Pradesh"],
  "Maharashtra": ["Goa", "Gujarat", "Karnataka", "Madhya Pradesh"],
  "Karnataka":   ["Tamil Nadu", "Kerala", "Andhra Pradesh", "Maharashtra"],
  "Delhi":       ["Haryana", "Uttar Pradesh", "Punjab"],
  "Tamil Nadu":  ["Karnataka", "Kerala", "Andhra Pradesh"],
};

class TrackingService {

  // ── Calculate distance category between two states ──
  getDistanceCategory(fromState, toState) {
    if (!fromState || !toState) return "default";
    if (fromState === toState) return "same";
    if (NEAR_STATES[fromState]?.includes(toState)) return "near";
    return "far";
  }

  // ── Calculate ETA based on status + distance ──
  calculateETA(currentStatus, pickupState, deliveryState, createdAt = new Date()) {
    const baseDays  = STATUS_DELIVERY_DAYS[currentStatus] ?? 5;
    const distCat   = this.getDistanceCategory(pickupState, deliveryState);
    const distDays  = INTER_STATE_DAYS[distCat];

    // Take the smaller of (status-based, distance-based)
    // Status-based shrinks as order progresses
    const days = Math.min(baseDays, distDays);

    const eta = new Date(createdAt);
    eta.setDate(eta.getDate() + days);
    return eta;
  }

  // ── Create tracking on order creation ──
  async createTracking(orderId) {
    const order = await Order.findById(orderId)
      .populate({
        path: "seller",
        populate: { path: "pickupAddress" },
      })
      .populate("shippingAddress");

    if (!order) throw new Error("Order not found");

    // Get seller pickup address
    let pickupLocation = {
      address: "Seller Warehouse",
      city:    "—",
      state:   "—",
      pinCode: "—",
    };

    if (order.seller?.pickupAddress) {
      const addr = order.seller.pickupAddress;
      pickupLocation = {
        address: addr.address || "—",
        city:    addr.city    || "—",
        state:   addr.state   || "—",
        pinCode: addr.pinCode || "—",
      };
    } else if (order.seller?.businessDetails?.businessAddress) {
      pickupLocation.address = order.seller.businessDetails.businessAddress;
    }

    const existing = await Tracking.findOne({ order: orderId });
    if (existing) return existing;

    // ✅ Smart ETA based on distance
    const deliveryState = order.shippingAddress?.state;
    const estimatedDelivery = this.calculateETA(
      "ORDER_PLACED",
      pickupLocation.state,
      deliveryState,
      order.createdAt || new Date()
    );

    const tracking = await Tracking.create({
      order:           orderId,
      pickupLocation,
      estimatedDelivery,
      currentStatus:   "ORDER_PLACED",
      currentLocation: STATUS_MESSAGES.ORDER_PLACED.location,
      events: [{
        status:      "ORDER_PLACED",
        description: STATUS_MESSAGES.ORDER_PLACED.desc,
        location:    STATUS_MESSAGES.ORDER_PLACED.location,
        timestamp:   new Date(),
      }],
    });

    return tracking;
  }

  // ── Update tracking status (auto-recalculates ETA) ──
  async updateStatus(orderId, newStatus, customMessage, customLocation) {
    let tracking = await Tracking.findOne({ order: orderId });
    if (!tracking) {
      tracking = await this.createTracking(orderId);
    }

    const config = STATUS_MESSAGES[newStatus] || { desc: newStatus, location: "Updated" };

    tracking.currentStatus   = newStatus;
    tracking.currentLocation = customLocation || config.location;

    tracking.events.push({
      status:      newStatus,
      description: customMessage || config.desc,
      location:    customLocation || config.location,
      timestamp:   new Date(),
    });

    // ✅ Recalculate ETA on major status changes
    const MAJOR_STATUSES = ["CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"];
    if (MAJOR_STATUSES.includes(newStatus)) {
      const order = await Order.findById(orderId).populate("shippingAddress");
      const newETA = this.calculateETA(
        newStatus,
        tracking.pickupLocation?.state,
        order.shippingAddress?.state,
        new Date()
      );
      tracking.estimatedDelivery = newETA;
    }

    if (newStatus === "DELIVERED") {
      tracking.estimatedDelivery = new Date();
    }

    await tracking.save();
    return tracking;
  }

  // ── Get tracking by order ──
  async getByOrderId(orderId) {
    let tracking = await Tracking.findOne({ order: orderId });
    if (!tracking) {
      tracking = await this.createTracking(orderId);
    }
    return tracking;
  }

  async updateEstimatedDelivery(orderId, date) {
    return await Tracking.findOneAndUpdate(
      { order: orderId },
      { estimatedDelivery: new Date(date) },
      { new: true }
    );
  }

  async updateCarrier(orderId, carrier, trackingNumber) {
    return await Tracking.findOneAndUpdate(
      { order: orderId },
      { carrier, trackingNumber },
      { new: true }
    );
  }
}

module.exports = new TrackingService();