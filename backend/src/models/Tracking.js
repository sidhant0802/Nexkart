const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema({
  status:      { type: String, required: true },
  description: { type: String, required: true },
  location:    { type: String },
  timestamp:   { type: Date, default: Date.now },
}, { _id: false });

const trackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  "Order",
    required: true,
    unique:   true,
    index:    true,
  },
  carrier:        { type: String, default: "Nexkart Express" },
  trackingNumber: { type: String, default: () => `NXK${Date.now()}${Math.floor(Math.random()*1000)}` },

  // Pickup (seller) location
  pickupLocation: {
    address: String,
    city:    String,
    state:   String,
    pinCode: String,
  },

  // Estimated delivery
  estimatedDelivery: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },

  // Current state
  currentStatus: {
    type: String,
    enum: [
      "ORDER_PLACED",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ],
    default: "ORDER_PLACED",
  },

  // Timeline events
  events: [trackingEventSchema],

  // Current location for live tracking
  currentLocation: { type: String, default: "Order placed" },

  notes: { type: String },
}, { timestamps: true });

const Tracking = mongoose.model("Tracking", trackingSchema);
module.exports = Tracking;