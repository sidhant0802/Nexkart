const express          = require("express");
const router           = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware   = require("../middlewares/userAuthMiddleware");  // ✅ FIXED
const reviewRateLimit  = require("../middlewares/reviewRateLimit");

// ✅ Apply rate limit ONLY on create/update (not on GET)
router.post(
  "/product/:productId",
  authMiddleware,
  reviewRateLimit,
  reviewController.createReview
);

router.get("/product/:productId", reviewController.getReviewsByProductId);

router.patch(
  "/:reviewId",
  authMiddleware,
  reviewRateLimit,
  reviewController.updateReview
);

router.delete(
  "/:reviewId",
  authMiddleware,
  reviewController.deleteReview
);

module.exports = router;