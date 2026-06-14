const express = require("express");
const router  = express.Router();
const productController = require("../controllers/productController");
const { cache } = require("../middlewares/cacheMiddleware");

// ✅ Aggressive caching on read endpoints
router.get("/",              cache(120),  productController.getAllProducts);    // 2 min
router.get("/:id/listings",  cache(300),  productController.getProductListings); // 5 min
router.get("/:id",           cache(600),  productController.getProductById);    // 10 min

// ✅ Search routes (if exists)
if (productController.searchProduct) {
  router.get("/search/:query", cache(180), productController.searchProduct);    // 3 min
}

// Write operations (no cache)
router.post("/",      productController.createProduct);
router.put("/:id",    productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;