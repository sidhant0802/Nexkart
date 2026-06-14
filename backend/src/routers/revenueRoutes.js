const express = require("express");
const router  = express.Router();
const revenueController     = require("../controllers/revenueController");
const sellerAuthMiddleware  = require("../middlewares/sellerAuthMiddleware");

router.get("/chart", sellerAuthMiddleware, revenueController.getRevenueChart);
router.get("/stats", sellerAuthMiddleware, revenueController.getDashboardStats);

module.exports = router;