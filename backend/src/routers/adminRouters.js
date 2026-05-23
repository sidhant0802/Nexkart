const express = require("express");
const router  = express.Router();
const adminProductController = require("../controllers/adminProductController");

// ✅ RULE: Most specific routes FIRST, dynamic /:id routes LAST

// ── Static routes (no params) ──
router.get("/stats",       adminProductController.getProductStats);
router.get("/sellers/all", adminProductController.getAllSellers);
router.get("/",            adminProductController.getAllProducts);
router.post("/",           adminProductController.createProduct);

// ── Listing routes (must be BEFORE /:id to avoid conflict) ──
router.put   ("/listings/:listingId", adminProductController.updateListing);
router.delete("/listings/:listingId", adminProductController.deleteListing);

// ── Dynamic /:id routes ──
router.get   ("/:id/listings", adminProductController.getProductListings);
router.post  ("/:id/listings", adminProductController.addSellerListing);
router.put   ("/:id",          adminProductController.updateProduct);
router.delete("/:id",          adminProductController.deleteProduct);

module.exports = router;