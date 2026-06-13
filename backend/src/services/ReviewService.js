const Review        = require("../models/Review");
const Product       = require("../models/Product");
const createError   = require("http-errors");
const ProductService = require("./ProductService");
const mongoose      = require("mongoose");

class ReviewService {

  async createReview(reqBody, user, productId) {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw createError.BadRequest("Invalid product ID");
    }

    const product = await ProductService.findProductById(productId);
    if (!product) throw createError.NotFound("Product not found");

    const review = new Review({
      user:          user._id,
      product:       product._id,
      rating:        reqBody.rating,
      reviewText:    reqBody.reviewText,
      productImages: reqBody.productImages ?? [],  // ✅ FIX - save uploaded media
    });

    const savedReview = await review.save();
    // ✅ FIX - populate fullName (NOT firstName/lastName which don't exist on User schema)
    return Review.findById(savedReview._id)
      .populate("user", "fullName email firstName lastName");
  }

  async getReviewsByProductId(productId) {
    if (!productId || productId === "undefined" || productId === "null") {
      return [];
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("⚠️  Invalid productId for reviews:", productId);
      return [];
    }

    const reviews = await Review.find({ product: productId })
      // ✅ FIX - populate fullName
      .populate("user", "fullName email firstName lastName")
      .sort({ createdAt: -1 });

    return reviews;
  }

  async updateReview(reviewId, reviewText, rating, userId) {
    const review = await Review.findById(reviewId);
    if (!review) throw createError.NotFound("Review not found");

    if (review.user.toString() !== userId.toString()) {
      throw createError.Unauthorized("You are not authorized to update this review");
    }

    review.reviewText = reviewText;
    review.rating     = rating;
    await review.save();
    return review;
  }

  async deleteReview(reviewId, userId) {
    const review = await Review.findById(reviewId);
    if (!review) throw createError.NotFound("Review not found");

    if (review.user.toString() !== userId.toString()) {
      throw createError.Unauthorized("You are not authorized to delete this review");
    }

    await review.deleteOne();
  }
}

module.exports = new ReviewService();