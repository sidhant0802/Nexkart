const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  orderItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'DAMAGED_PRODUCT',
      'WRONG_PRODUCT',
      'NOT_AS_DESCRIBED',
      'QUALITY_ISSUE',
      'CHANGED_MIND',
      'OTHER',
    ],
  },
  description: {
    type: String,
    default: '',
  },
  images: [{ type: String }], // cloudinary urls
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'REFUNDED'],
    default: 'REQUESTED',
  },
  sellerNote: {
    type: String,
    default: '',
  },
  returnWindowDays: {
    type: Number,
    default: 7,
  },
  returnDeadline: {
    type: Date,
    required: true,
  },
  deliveredAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Return = mongoose.model('Return', returnSchema);
module.exports = Return;