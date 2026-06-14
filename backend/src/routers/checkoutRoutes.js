// backend/src/routers/checkoutRoutes.js
const express             = require("express");
const router              = express.Router();
const checkoutController  = require("../controllers/checkoutController");
const userAuthMiddleware  = require("../middlewares/userAuthMiddleware");

// Buy now (single product, skip cart)
router.post("/buy-now",        userAuthMiddleware, checkoutController.buyNow);

// Cart checkout (multiple items)
router.post("/cart",           userAuthMiddleware, checkoutController.checkoutCart);

// Razorpay verification
router.post("/verify-payment", userAuthMiddleware, checkoutController.verifyPayment);

// Payment failed (release stock)
router.post("/payment-failed", userAuthMiddleware, checkoutController.paymentFailed);

// Get seller's available payment options
router.get("/seller-payment-options/:sellerId", checkoutController.getSellerPaymentOptions);

module.exports = router;