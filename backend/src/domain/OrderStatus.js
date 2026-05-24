const OrderStatus = Object.freeze({
  PENDING:           "PENDING",
  PAYMENT_PENDING:   "PAYMENT_PENDING",
  CONFIRMED:         "CONFIRMED",
  PLACED:            "PLACED",
  PROCESSING:        "PROCESSING",
  SHIPPED:           "SHIPPED",
  OUT_FOR_DELIVERY:  "OUT_FOR_DELIVERY",
  DELIVERED:         "DELIVERED",
  CANCELLED:         "CANCELLED",
  REFUNDED:          "REFUNDED",
});

module.exports = OrderStatus;