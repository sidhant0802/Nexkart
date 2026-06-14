const express = require("express");
const router  = express.Router();
const trackingController   = require("../controllers/trackingController");
const userAuthMiddleware   = require("../middlewares/userAuthMiddleware");
const sellerAuthMiddleware = require("../middlewares/sellerAuthMiddleware");

// Customer: view tracking
router.get("/:orderId", userAuthMiddleware, trackingController.getTracking);

// Seller: update tracking
router.put("/:orderId/status", sellerAuthMiddleware, trackingController.updateStatus);

module.exports = router;