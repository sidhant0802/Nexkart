const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        uppercase: true,  // ✅ Store codes in uppercase always
        trim: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    validityStartDate: {
        type: Date,
        required: true,
    },
    validityEndDate: {
        type: Date,
        required: true,
    },
    minimumOrderValue: {
        type: Number,
        required: true,
        default: 0,
    },
    // ✅ Consistent field name "isActive"
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;