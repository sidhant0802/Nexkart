const express = require("express");
const router  = express.Router();
const brandController = require("../controllers/brandController");
const { cache } = require("../middlewares/cacheMiddleware");
const { uploadToCloudinary } = require("../middlewares/uploadToCloudinary");

// ✅ Smart brand filter - brands actually selling in this category
router.get("/by-category/:categoryId", cache(300), (req, res) =>
  brandController.getBrandsByCategory(req, res)
);

router.get("/",    cache(3600), brandController.getAllBrands);
router.get("/:id", cache(3600), brandController.getBrandById);

router.post("/",   uploadToCloudinary(["logo"]), brandController.createBrand);
router.put("/:id", uploadToCloudinary(["logo"]), brandController.updateBrand);
router.delete("/:id",         brandController.deleteBrand);
router.patch("/:id/featured", brandController.toggleFeatured);

module.exports = router;
