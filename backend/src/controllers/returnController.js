const Return       = require('../models/Return');
const Order        = require('../models/Order');
const OrderItem    = require('../models/OrderItem');
const Seller       = require('../models/Seller');
const Notification = require('../models/Notification');
const { getIO }    = require('../config/socket');

class ReturnController {

  // ── Customer: Request a return ──
  async requestReturn(req, res) {
    try {
      const { orderId, orderItemId } = req.params;
      const { reason, description }  = req.body;
      const userId = req.user._id;

      // 1. Find order
      const order = await Order.findById(orderId).populate('seller');
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // 2. Check ownership
      if (order.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not your order' });
      }

      // 3. Must be delivered
      if (order.orderStatus !== 'DELIVERED') {
        return res.status(400).json({ message: 'Order must be delivered to request return' });
      }

      // 4. Check return window
      const seller = await Seller.findById(order.seller._id);
      const returnWindowDays = seller?.returnWindowDays || 7;
      const deliveredAt  = new Date(order.deliverDate);
      const returnDeadline = new Date(deliveredAt);
      returnDeadline.setDate(returnDeadline.getDate() + returnWindowDays);

      if (new Date() > returnDeadline) {
        return res.status(400).json({
          message: `Return window of ${returnWindowDays} days has expired`,
          expiredAt: returnDeadline,
        });
      }

      // 5. Check if return already requested for this item
      const existing = await Return.findOne({ orderItem: orderItemId, user: userId });
      if (existing) {
        return res.status(400).json({ message: 'Return already requested for this item' });
      }

      // 6. Create return
      const returnRequest = await Return.create({
        order:            orderId,
        orderItem:        orderItemId,
        user:             userId,
        seller:           order.seller._id,
        reason,
        description:      description || '',
        returnWindowDays,
        returnDeadline,
        deliveredAt,
        status:           'REQUESTED',
      });

      // 7. Notify seller
      const notification = await Notification.create({
        recipient:     order.seller._id,
        recipientType: 'seller',
        type:          'RETURN_UPDATE',
        title:         '🔄 New Return Request',
        message:       `Customer requested return for order #${orderId.toString().slice(-6).toUpperCase()}`,
        link:          `/seller/orders`,
        data:          { orderId, returnId: returnRequest._id },
      });

      // 8. Socket emit to seller
      try {
        const io = getIO();
        io.to(`seller:${order.seller._id}`).emit('notification:new', {
          notification,
        });
      } catch (e) {}

      return res.status(201).json({
        message: 'Return requested successfully',
        return:  returnRequest,
        deadline: returnDeadline,
      });

    } catch (error) {
      console.error('requestReturn error:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Customer: Get return status for an order item ──
  async getReturnStatus(req, res) {
    try {
      const { orderItemId } = req.params;
      const userId = req.user._id;

      const returnReq = await Return.findOne({ orderItem: orderItemId, user: userId });
      if (!returnReq) return res.status(404).json({ message: 'No return request found' });

      return res.status(200).json(returnReq);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Customer: Check if return is eligible ──
  async checkReturnEligibility(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;

      const order = await Order.findById(orderId).populate('seller');
      if (!order) return res.status(404).json({ message: 'Order not found' });
      if (order.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not your order' });
      }

      if (order.orderStatus !== 'DELIVERED') {
        return res.status(200).json({
          eligible: false,
          reason: 'Order not delivered yet',
        });
      }

      const seller = await Seller.findById(order.seller._id);
      const returnWindowDays = seller?.returnWindowDays || 7;
      const deliveredAt    = new Date(order.deliverDate);
      const returnDeadline = new Date(deliveredAt);
      returnDeadline.setDate(returnDeadline.getDate() + returnWindowDays);

      const now       = new Date();
      const eligible  = now <= returnDeadline;
      const daysLeft  = Math.max(
        0,
        Math.ceil((returnDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return res.status(200).json({
        eligible,
        returnWindowDays,
        deliveredAt,
        returnDeadline,
        daysLeft,
        reason: eligible ? null : 'Return window expired',
      });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Seller: Get all return requests ──
  async getSellerReturns(req, res) {
    try {
      const sellerId = req.seller._id;
      const returns  = await Return.find({ seller: sellerId })
        .populate('order')
        .populate('orderItem')
        .populate({ path: 'user', select: 'fullName email mobile' })
        .sort({ createdAt: -1 });

      return res.status(200).json(returns);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ── Seller: Update return status ──
  async updateReturnStatus(req, res) {
    try {
      const { returnId } = req.params;
      const { status, sellerNote } = req.body;
      const sellerId = req.seller._id;

      const returnReq = await Return.findById(returnId);
      if (!returnReq) return res.status(404).json({ message: 'Return not found' });
      if (returnReq.seller.toString() !== sellerId.toString()) {
        return res.status(403).json({ message: 'Not your return request' });
      }

      returnReq.status     = status;
      returnReq.sellerNote = sellerNote || '';
      await returnReq.save();

      // Notify customer
      const statusMessages = {
        APPROVED:  '✅ Your return request has been approved!',
        REJECTED:  '❌ Your return request was rejected',
        PICKED_UP: '📦 Your return has been picked up',
        REFUNDED:  '💰 Your refund has been processed',
      };

      const notification = await Notification.create({
        recipient:     returnReq.user,
        recipientType: 'user',
        type:          'RETURN_UPDATE',
        title:         'Return Request Update',
        message:       statusMessages[status] || `Return status: ${status}`,
        link:          `/account/orders`,
        data:          { returnId, orderId: returnReq.order },
      });

      // Socket emit to user
      try {
        const io = getIO();
        io.to(`user:${returnReq.user}`).emit('notification:new', { notification });
      } catch (e) {}

      return res.status(200).json({ message: 'Return updated', return: returnReq });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ReturnController();