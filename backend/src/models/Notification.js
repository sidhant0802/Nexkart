const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // can be user or seller id
  },
  recipientType: {
    type: String,
    enum: ['user', 'seller'],
    required: true,
  },
  type: {
    type: String,
    enum: [
      'ORDER_STATUS',    // delivery update
      'NEW_MESSAGE',     // chat message
      'RETURN_UPDATE',   // return approved/rejected
      'ORDER_PLACED',    // new order for seller
      'GENERAL',
    ],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '' },   // where to navigate on click
  read:    { type: Boolean, default: false },
  data:    { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Index for fast queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;