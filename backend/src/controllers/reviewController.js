const ReviewService = require("../services/ReviewService");
const Review        = require("../models/Review");
const mongoose      = require("mongoose");

// Basic spam word list
const SPAM_WORDS = [
  "viagra", "casino", "lottery", "winner",
  "free money", "click here", "buy now",
];

const isSpam = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SPAM_WORDS.some(word => lower.includes(word));
};

class ReviewController {

  async createReview(req, res, next) {
    try {
      const { productId } = req.params;
      const user          = await req.user;

      // ✅ Guard
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      if (!user || !user._id) {
        return res.status(401).json({ error: "Login required" });
      }

      // ✅ NEW — Duplicate check (1 review per user per product)
      const existing = await Review.findOne({
        user:    user._id,
        product: productId,
      });

      if (existing) {
        return res.status(409).json({
          error:    "You have already reviewed this product",
          reviewId: existing._id,
        });
      }

      // ✅ NEW — Basic spam check
      const { reviewText } = req.body;
      if (isSpam(reviewText)) {
        return res.status(400).json({
          error: "Review contains spam content",
        });
      }

      // ✅ NEW — Length validation
      if (!reviewText || reviewText.trim().length < 5) {
        return res.status(400).json({
          error: "Review must be at least 5 characters",
        });
      }

      if (reviewText.length > 1000) {
        return res.status(400).json({
          error: "Review must be under 1000 characters",
        });
      }

      const review = await ReviewService.createReview(req.body, user, productId);
      return res.status(201).json(review);
    } catch (error) {
      // Handle MongoDB unique constraint error
      if (error.code === 11000) {
        return res.status(409).json({
          error: "You have already reviewed this product",
        });
      }
      next(error);
    }
  }

  async getReviewsByProductId(req, res, next) {
    try {
      const { productId } = req.params;

      if (!productId || productId === "undefined" || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(200).json([]);
      }

      const reviews = await ReviewService.getReviewsByProductId(productId);
      return res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const { reviewId }           = req.params;
      const { reviewText, rating } = req.body;

      if (isSpam(reviewText)) {
        return res.status(400).json({ error: "Review contains spam content" });
      }

      const review = await ReviewService.updateReview(
        reviewId,
        reviewText,
        rating,
        req.user._id
      );

      return res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      await ReviewService.deleteReview(reviewId, req.user._id);
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();