const mongoose = require('mongoose');

const productListingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true,
    },
    mrpPrice: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
        index: true,
    },
    discountPercent: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        default: 50,
    },
    // Seller-specific delivery promise
    deliveryDays: {
        type: Number,
        default: 5,
    },
    // Cached seller rating (for fast sorting)
    sellerRating: {
        type: Number,
        default: 0,
    },
    sellerTotalReviews: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    // # of times this listing was sold
    totalSold: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// One seller can have only ONE active listing per product
productListingSchema.index({ product: 1, seller: 1 }, { unique: true });
productListingSchema.index({ product: 1, sellingPrice: 1 });

const ProductListing = mongoose.model('ProductListing', productListingSchema);
module.exports = ProductListing;