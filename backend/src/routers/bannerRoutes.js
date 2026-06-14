const express = require("express");
const router  = express.Router();
const bannerController = require("../controllers/bannerController");
const { uploadToCloudinary } = require("../middlewares/uploadToCloudinary"); // ✅ ADD

// public
router.get("/", bannerController.getAllBanners);

// admin
router.post("/",
  uploadToCloudinary(["image"]),    // ✅ ADD
  bannerController.createBanner
);
router.patch("/reorder", bannerController.reorderBanners);
router.patch("/:id",
  uploadToCloudinary(["image"]),    // ✅ ADD
  bannerController.updateBanner
);
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;