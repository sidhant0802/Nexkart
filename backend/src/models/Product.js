const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    // ✅ Brand slug for fast filtering
    brand: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
        index: true,
    },
    brandRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
    },
    images: {
        type: [String],
        default: [],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    sizes: {
        type: String,
        required: false,
    },
    // ✅ Aggregated price info (auto-updated from listings)
    minPrice: { type: Number, default: 0, index: true },     // Lowest selling price
    maxPrice: { type: Number, default: 0 },                  // Highest selling price
    minMrpPrice: { type: Number, default: 0 },
    totalSellers: { type: Number, default: 0 },              // # of sellers selling this
    totalStock: { type: Number, default: 0 },                // Sum of all seller stock
    // ✅ Default listing (lowest price one — for fast frontend display)
    defaultListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductListing',
    },
    // ✅ Overall product rating (across all sellers)
    numRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

productSchema.index({ brand: 1, category: 1 });
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ minPrice: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;