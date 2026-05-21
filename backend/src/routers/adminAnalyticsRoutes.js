const express = require("express");
const router  = express.Router();
const adminAnalyticsController = require("../controllers/adminAnalyticsController");

// Stock sold by product & seller
router.get("/stock-sold",        adminAnalyticsController.getStockSold);

// Top 5 sellers revenue pie chart
router.get("/seller-revenue",    adminAnalyticsController.getSellerRevenue);

// Product analytics - what users buy, category preferences
router.get("/product-analytics", adminAnalyticsController.getProductAnalytics);

// New seller notifications
router.get("/new-sellers",       adminAnalyticsController.getNewSellers);

// Mark notification as seen (update seller status awareness)
router.patch("/new-sellers/:id/seen", adminAnalyticsController.markSellerSeen);

module.exports = router;