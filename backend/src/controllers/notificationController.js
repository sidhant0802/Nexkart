const Notification = require('../models/Notification');
const Seller       = require('../models/Seller');
const Order        = require('../models/Order');
const User         = require('../models/User');

class NotificationController {

  // ── Customer: Get notifications ──
  async getUserNotifications(req, res) {
    try {
      const userId = req.user._id;
      const notifications = await Notification.find({
        recipient:     userId,
        recipientType: 'user',
      })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        recipient:     userId,
        recipientType: 'user',
        read:          false,
      });

      return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Customer: Mark notifications as read ──
  async markUserNotificationsRead(req, res) {
    try {
      const userId = req.user._id;
      const { notificationIds } = req.body; // optional: specific IDs

      const filter = {
        recipient:     userId,
        recipientType: 'user',
      };
      if (notificationIds?.length) {
        filter._id = { $in: notificationIds };
      }

      await Notification.updateMany(filter, { $set: { read: true } });
      return res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Seller: Get notifications ──
  async getSellerNotifications(req, res) {
    try {
      const sellerId = req.seller._id;
      const notifications = await Notification.find({
        recipient:     sellerId,
        recipientType: 'seller',
      })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        recipient:     sellerId,
        recipientType: 'seller',
        read:          false,
      });

      return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Seller: Mark as read ──
  async markSellerNotificationsRead(req, res) {
    try {
      const sellerId = req.seller._id;
      await Notification.updateMany(
        { recipient: sellerId, recipientType: 'seller' },
        { $set: { read: true } }
      );
      return res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Admin: Get notifications (old logic kept) ──
  async getAdminNotifications(req, res) {
    try {
      const notifications = [];

      const pendingSellers = await Seller
        .find({ accountStatus: 'PENDING_VERIFICATION' })
        .sort({ createdAt: -1 })
        .limit(10);

      pendingSellers.forEach((s) => {
        notifications.push({
          id:        `seller_${s._id}`,
          type:      'seller_request',
          title:     'New Seller Request',
          message:   `${s.sellerName || s.email} wants to become a seller`,
          link:      '/admin/sellers',
          createdAt: s.createdAt,
          read:      false,
          priority:  'high',
          icon:      '🏪',
        });
      });

      const yesterday    = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentOrders = await Order
        .find({ createdAt: { $gte: yesterday } })
        .sort({ createdAt: -1 })
        .limit(5);

      recentOrders.forEach((o) => {
        notifications.push({
          id:        `order_${o._id}`,
          type:      'new_order',
          title:     'New Order',
          message:   `Order #${o._id.toString().slice(-6)} placed`,
          link:      '/admin/orders',
          createdAt: o.createdAt,
          read:      false,
          priority:  'medium',
          icon:      '📦',
        });
      });

      const lastWeek      = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsersCount = await User.countDocuments({ createdAt: { $gte: lastWeek } });

      if (newUsersCount > 0) {
        notifications.push({
          id:        'users_week',
          type:      'user_signup',
          title:     'New Users',
          message:   `${newUsersCount} new users signed up this week`,
          link:      '/admin/users',
          createdAt: new Date(),
          read:      false,
          priority:  'low',
          icon:      '👤',
        });
      }

      notifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return res.status(200).json({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        counts: {
          pendingSellers: pendingSellers.length,
          newOrders:      recentOrders.length,
          newUsers:       newUsersCount,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();