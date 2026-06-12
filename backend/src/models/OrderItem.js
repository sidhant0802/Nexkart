const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    // ✅ NEW: Track which listing/seller was used
    productListing: {
        type: Schema.Types.ObjectId,
        ref: 'ProductListing',
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    mrpPrice: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    // For seller review prompt after delivery
    sellerReviewed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;