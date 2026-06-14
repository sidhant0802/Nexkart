const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type:     String,
    enum:     ['user', 'seller'],
    required: true,
  },
  senderId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
  },
  text: {
    type:    String,
    default: '',
  },
  mediaUrl: {
    type:    String,
    default: null,
  },
  // ✅ NO null in enum
  mediaType: {
    type:     String,
    enum:     ['image', 'video'],
    required: false,
  },
  read: {
    type:    Boolean,
    default: false,
  },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  order: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Order',
    required: true,
    unique:   true,
    index:    true,
  },
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  seller: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Seller',
    required: true,
  },
  messages:      { type: [messageSchema], default: [] },
  lastMessage:   { type: String,  default: ''       },
  lastMessageAt: { type: Date,    default: Date.now },
  userUnread:    { type: Number,  default: 0        },
  sellerUnread:  { type: Number,  default: 0        },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;