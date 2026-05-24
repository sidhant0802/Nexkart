const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewText: {
        type:     String,
        required: true,
        minlength: 5,
        maxlength: 1000,
    },
    rating: {
        type:     Number,
        required: true,
        min:      1,
        max:      5,
    },
    productImages: {
        type:    [String],
        default: [],
    },
    product: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'Product',
        required: true,
    },
    user: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
    },
    createdAt: {
        type:    Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// ✅ UNIQUE INDEX — 1 review per user per product (DB-level enforcement)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// ✅ Performance index
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;