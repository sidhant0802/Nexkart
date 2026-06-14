const Chat         = require('../models/Chat');
const Order        = require('../models/Order');
const Notification = require('../models/Notification');
const cloudinary   = require('../config/cloudinary');
const { getIO }    = require('../config/socket');

class ChatController {

  // ── Get or create chat for an order ──
  async getOrCreateChat(req, res) {
    try {
      const { orderId } = req.params;

      // Determine if user or seller
      const isUser   = !!req.user;
      const isSeller = !!req.seller;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // Verify access
      if (isUser && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not your order' });
      }
      if (isSeller && order.seller.toString() !== req.seller._id.toString()) {
        return res.status(403).json({ message: 'Not your order' });
      }

      let chat = await Chat.findOne({ order: orderId })
        .populate({ path: 'user',   select: 'fullName email' })
        .populate({ path: 'seller', select: 'sellerName businessDetails' });

      if (!chat) {
        chat = await Chat.create({
          order:  orderId,
          user:   order.user,
          seller: order.seller,
        });
        chat = await Chat.findById(chat._id)
          .populate({ path: 'user',   select: 'fullName email' })
          .populate({ path: 'seller', select: 'sellerName businessDetails' });
      }

      // Mark messages as read
      if (isUser) {
        await Chat.findByIdAndUpdate(chat._id, {
          $set: { 'messages.$[elem].read': true, userUnread: 0 },
        }, {
          arrayFilters: [{ 'elem.sender': 'seller' }],
        });
      }
      if (isSeller) {
        await Chat.findByIdAndUpdate(chat._id, {
          $set: { 'messages.$[elem].read': true, sellerUnread: 0 },
        }, {
          arrayFilters: [{ 'elem.sender': 'user' }],
        });
      }

      return res.status(200).json(chat);
    } catch (error) {
      console.error('getOrCreateChat error:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Send a message ──
  async sendMessage(req, res) {
    try {
      const { orderId } = req.params;
      const { text }    = req.body;

      const isUser   = !!req.user;
      const isSeller = !!req.seller;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // Handle media upload if file exists
      let mediaUrl  = null;
      let mediaType = null;

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder:        'nexkart/chat',
          resource_type: 'auto',  // handles both image and video
        });
        mediaUrl  = result.secure_url;
        mediaType = result.resource_type === 'video' ? 'video' : 'image';
      }

      // Must have text or media
      if (!text && !mediaUrl) {
        return res.status(400).json({ message: 'Message cannot be empty' });
      }

      const senderId   = isUser ? req.user._id : req.seller._id;
      const senderType = isUser ? 'user' : 'seller';

      let chat = await Chat.findOne({ order: orderId });
      if (!chat) {
        chat = await Chat.create({
          order:  orderId,
          user:   order.user,
          seller: order.seller,
        });
      }

      const newMessage = {
        sender:    senderType,
        senderId,
        text:      text || '',
        mediaUrl,
        mediaType,
        read:      false,
      };

      // Add message and update counters
      const updateObj = {
        $push: { messages: newMessage },
        $set:  {
          lastMessage:   text || (mediaType === 'image' ? '📷 Image' : '🎥 Video'),
          lastMessageAt: new Date(),
        },
      };

      if (isUser) {
        updateObj.$inc = { sellerUnread: 1 };
      } else {
        updateObj.$inc = { userUnread: 1 };
      }

      const updatedChat = await Chat.findByIdAndUpdate(chat._id, updateObj, { new: true })
        .populate({ path: 'user',   select: 'fullName email' })
        .populate({ path: 'seller', select: 'sellerName businessDetails' });

      const savedMessage = updatedChat.messages[updatedChat.messages.length - 1];

      // ── Real-time emit via Socket.IO ──
      try {
        const io = getIO();

        // Emit to the order room
        io.to(`order:${orderId}`).emit('chat:message', {
          chatId:  updatedChat._id,
          orderId,
          message: savedMessage,
        });

        // Notify the OTHER party
        if (isUser) {
          // Notify seller
          io.to(`seller:${order.seller}`).emit('notification:new', {
            notification: {
              type:    'NEW_MESSAGE',
              title:   '💬 New Message',
              message: `Customer sent a message: ${text?.slice(0, 40) || 'Media'}`,
              link:    `/seller/orders`,
              data:    { orderId, chatId: updatedChat._id },
              createdAt: new Date(),
              read:    false,
            },
          });

          // Save notification in DB
          await Notification.create({
            recipient:     order.seller,
            recipientType: 'seller',
            type:          'NEW_MESSAGE',
            title:         '💬 New Message',
            message:       `Customer sent: ${text?.slice(0, 60) || 'sent a media file'}`,
            link:          `/seller/orders`,
            data:          { orderId, chatId: updatedChat._id },
          });

        } else {
          // Notify user
          io.to(`user:${order.user}`).emit('notification:new', {
            notification: {
              type:    'NEW_MESSAGE',
              title:   '💬 Message from Seller',
              message: text?.slice(0, 60) || 'Seller sent a media file',
              link:    `/account/orders/${orderId}/chat`,
              data:    { orderId, chatId: updatedChat._id },
              createdAt: new Date(),
              read:    false,
            },
          });

          await Notification.create({
            recipient:     order.user,
            recipientType: 'user',
            type:          'NEW_MESSAGE',
            title:         '💬 Message from Seller',
            message:       text?.slice(0, 60) || 'Seller sent a media file',
            link:          `/account/orders/${orderId}/chat`,
            data:          { orderId, chatId: updatedChat._id },
          });
        }
      } catch (socketErr) {
        console.error('Socket emit error:', socketErr.message);
      }

      return res.status(201).json({ message: savedMessage, chat: updatedChat });

    } catch (error) {
      console.error('sendMessage error:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Get user's all chats (for notification badge) ──
  async getUserChats(req, res) {
    try {
      const userId = req.user._id;
      const chats  = await Chat.find({ user: userId })
        .populate({ path: 'seller', select: 'sellerName businessDetails' })
        .populate({ path: 'order',  select: 'orderStatus' })
        .select('-messages')
        .sort({ lastMessageAt: -1 });

      return res.status(200).json(chats);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Get seller's all chats ──
  async getSellerChats(req, res) {
    try {
      const sellerId = req.seller._id;
      const chats    = await Chat.find({ seller: sellerId })
        .populate({ path: 'user',  select: 'fullName email' })
        .populate({ path: 'order', select: 'orderStatus' })
        .select('-messages')
        .sort({ lastMessageAt: -1 });

      return res.status(200).json(chats);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ChatController();