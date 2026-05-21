const express = require("express");
const router  = express.Router();
const adminProductController = require("../controllers/adminProductController");
const { uploadToCloudinary } = require("../middlewares/uploadToCloudinary"); // ✅ ADD

router.get("/stats",         adminProductController.getProductStats);
router.get("/sellers/all",   adminProductController.getAllSellers);

router.get("/",              adminProductController.getAllProducts);
router.post("/",
  uploadToCloudinary(["images"]),  // ✅ ADD
  adminProductController.createProduct
);
router.put("/:id",
  uploadToCloudinary(["images"]),  // ✅ ADD
  adminProductController.updateProduct
);
router.delete("/:id",        adminProductController.deleteProduct);

router.get("/:id/listings",           adminProductController.getProductListings);
router.post("/:id/listings",          adminProductController.addSellerListing);
router.put("/listings/:listingId",    adminProductController.updateListing);
router.delete("/listings/:listingId", adminProductController.deleteListing);

module.exports = router;