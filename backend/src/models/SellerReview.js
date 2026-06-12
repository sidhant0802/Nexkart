const mongoose = require('mongoose');

const sellerReviewSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        default: '',
    },
}, { timestamps: true });

sellerReviewSchema.index({ seller: 1, user: 1 });

const SellerReview = mongoose.model('SellerReview', sellerReviewSchema);
module.exports = SellerReview;