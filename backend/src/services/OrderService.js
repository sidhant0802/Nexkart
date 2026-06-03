const Order          = require("../models/Order");
const Address        = require("../models/Address");
const User           = require("../models/User");
const OrderItem      = require("../models/OrderItem");
const ProductListing = require("../models/ProductListing");
const OrderError     = require("../exceptions/OrderError");
const OrderStatus    = require("../domain/OrderStatus");
const PaymentStatus  = require("../domain/PaymentStatus");
const mongoose       = require("mongoose");
const TransactionService = require("./TransactionService");
const TrackingService    = require("./TrackingService");
const StockLockService   = require("./StockLockService");

// ✅ NEW — Import queues for async processing
const {
  emailQueue,
  notificationQueue,
  analyticsQueue,
} = require("../queues/queueConfig");

const ORDER_POPULATE = [
  { path: "seller" },
  { path: "shippingAddress" },
  {
    path: "orderItems",
    populate: [
      { path: "product" },
      { path: "seller" },
    ],
  },
];

class OrderService {

  async createOrder(user, shippingAddress, cart) {
    try {
      if (shippingAddress._id && !user.addresses.includes(shippingAddress._id)) {
        user.addresses.push(shippingAddress._id);
        await User.findByIdAndUpdate(user._id, user);
      }

      if (!shippingAddress._id) {
        shippingAddress = await Address.create(shippingAddress);
        user.addresses.push(shippingAddress._id);
        await User.findByIdAndUpdate(user._id, user);
      }

      const itemsBySeller = cart.cartItems.reduce((acc, item) => {
        const sellerId = item.product.seller._id.toString();
        acc[sellerId] = acc[sellerId] || [];
        acc[sellerId].push(item);
        return acc;
      }, {});

      const orders = [];

      for (const [sellerId, cartItems] of Object.entries(itemsBySeller)) {
        const totalOrderPrice = cartItems.reduce((s, i) => s + i.sellingPrice, 0);
        const totalItemCount  = cartItems.reduce((s, i) => s + i.quantity, 0);

        const newOrder = new Order({
          user:              user._id,
          seller:            sellerId,
          totalMrpPrice:     totalOrderPrice,
          totalSellingPrice: totalOrderPrice,
          totalItem:         totalItemCount,
          shippingAddress:   shippingAddress._id,
          orderStatus:       OrderStatus.PENDING,
          paymentStatus:     PaymentStatus.PENDING,
          orderItems:        [],
        });

        await Promise.all(cartItems.map(async (cartItem) => {
          const orderItem = new OrderItem({
            mrpPrice:       cartItem.mrpPrice,
            product:        cartItem.product._id,
            seller:         sellerId,
            quantity:       cartItem.quantity,
            size:           cartItem.size,
            sellingPrice:   cartItem.sellingPrice,
            productListing: cartItem.productListing?._id || cartItem.productListing || null,
          });
          const saved = await orderItem.save();
          newOrder.orderItems.push(saved._id);

          const listingId = cartItem.productListing?._id || cartItem.productListing;
          if (listingId) {
            await ProductListing.findByIdAndUpdate(
              listingId,
              {
                $inc: {
                  quantity:  -cartItem.quantity,
                  totalSold:  cartItem.quantity,
                },
              }
            );
            console.log(`✅ Stock decremented for listing ${listingId} by ${cartItem.quantity}`);
          } else {
            console.log("⚠️ No productListing on cartItem — stock not decremented");
          }
        }));

        const savedOrder = await newOrder.save();

        try {
          await TransactionService.createTransaction(savedOrder._id);
          console.log("✅ Transaction created for order:", savedOrder._id);
        } catch (e) {
          console.error("⚠️ Transaction creation failed:", e.message);
        }

        // ✅ NEW — Queue background jobs (non-blocking!)
        try {
          // 1. Customer order confirmation email
          await emailQueue.add("order-confirmation", {
            type: "order-confirmation",
            to:   user.email,
            data: {
              orderId:  savedOrder._id.toString(),
              userName: user.fullName || "Customer",
              total:    totalOrderPrice,
            },
          });

          // 2. Notify seller about new order
          await notificationQueue.add("seller-new-order", {
            type:     "new-order",
            sellerId: sellerId,
            data: {
              orderId: savedOrder._id.toString(),
              items:   totalItemCount,
              total:   totalOrderPrice,
            },
          });

          // 3. Track analytics
          await analyticsQueue.add("order-placed", {
            event:     "order-placed",
            userId:    user._id.toString(),
            timestamp: Date.now(),
            data: {
              orderId: savedOrder._id.toString(),
              total:   totalOrderPrice,
              items:   totalItemCount,
              seller:  sellerId,
            },
          });

          console.log(`✅ Background jobs queued for order ${savedOrder._id}`);
        } catch (queueErr) {
          // Don't fail the order if queue fails
          console.error("⚠️ Queue error (non-blocking):", queueErr.message);
        }

        orders.push(savedOrder);
      }

      return orders;

    } catch (error) {
      console.log("createOrder error:", error);
      throw new Error(error.message);
    }
  }

  async findOrderById(orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new OrderError("Invalid Order ID...");
    }
    const order = await Order.findById(orderId).populate(ORDER_POPULATE);
    if (!order) throw new OrderError(`Order not found with id ${orderId}`);
    return order;
  }

  async findOrderItemById(orderItemId) {
    if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
      throw new OrderError("Invalid Order Item ID...");
    }
    const item = await OrderItem.findById(orderItemId).populate([
      { path: "product" },
      { path: "seller" },
    ]);
    if (!item) throw new OrderError(`OrderItem not found`);
    return item;
  }

  async usersOrderHistory(userId) {
    return await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate(ORDER_POPULATE);
  }

  async getShopsOrders(sellerId) {
    return await Order.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .populate(ORDER_POPULATE);
  }

  async updateOrderStatus(orderId, orderStatus) {
    const order = await this.findOrderById(orderId);
    const previousStatus = order.orderStatus;

    order.orderStatus = orderStatus;
    if (orderStatus === OrderStatus.DELIVERED) {
      order.deliverDate = new Date();
    }

    try {
      await TrackingService.updateStatus(orderId, orderStatus);
    } catch (e) {
      console.error("Tracking sync error:", e.message);
    }

    if (
      orderStatus === OrderStatus.DELIVERED &&
      previousStatus !== OrderStatus.DELIVERED
    ) {
      try {
        const orderItems = await OrderItem.find({ _id: { $in: order.orderItems } });
        for (const item of orderItems) {
          if (item.productListing) {
            await StockLockService.markAsSold(item.productListing, item.quantity);
          }
        }
      } catch (e) {
        console.error("Mark as sold error:", e.message);
      }
    }

    // ✅ NEW — Queue status update email + notification
    try {
      const populatedOrder = await Order.findById(orderId).populate("user");

      // Email customer about status change
      if (populatedOrder?.user?.email) {
        let emailType = null;
        if (orderStatus === OrderStatus.SHIPPED)   emailType = "order-shipped";
        if (orderStatus === OrderStatus.DELIVERED) emailType = "order-delivered";

        if (emailType) {
          await emailQueue.add(emailType, {
            type: emailType,
            to:   populatedOrder.user.email,
            data: {
              orderId:      orderId.toString(),
              userName:     populatedOrder.user.fullName || "Customer",
              deliveryDate: populatedOrder.deliverDate,
            },
          });
        }
      }

      // Real-time notification to user
      await notificationQueue.add("order-status-update", {
        type:   "order-status",
        userId: populatedOrder?.user?._id?.toString(),
        data: {
          orderId: orderId.toString(),
          status:  orderStatus,
        },
      });
    } catch (queueErr) {
      console.error("⚠️ Status update queue error:", queueErr.message);
    }

    return await Order.findByIdAndUpdate(orderId, order, {
      new: true,
      runValidators: true,
    }).populate(ORDER_POPULATE);
  }

  async deleteOrder(orderId) {
    const order = await this.findOrderById(orderId);
    if (!order) throw new OrderError(`Order not found`);
    return await Order.deleteOne({ _id: orderId });
  }

  async cancelOrder(orderId, user) {
    const order = await this.findOrderById(orderId);

    const userId = user._id || user;
    if (userId.toString() !== order.user.toString()) {
      throw new OrderError(`You can't perform this action on order id ${orderId}`);
    }

    if (order.orderStatus === OrderStatus.DELIVERED) {
      throw new OrderError("Cannot cancel a delivered order");
    }

    order.orderStatus = OrderStatus.CANCELLED;

    try {
      const orderItems = await OrderItem.find({ _id: { $in: order.orderItems } });
      for (const item of orderItems) {
        if (item.productListing) {
          await StockLockService.releaseStock(item.productListing, item.quantity);
          await StockLockService.syncProductStock(item.product);
        }
      }
    } catch (e) {
      console.error("Stock release error:", e.message);
    }

    try {
      await TrackingService.updateStatus(orderId, "CANCELLED", "Order cancelled by customer");
    } catch (e) {
      console.error("Tracking update error:", e.message);
    }

    // ✅ NEW — Notify analytics about cancellation
    try {
      await analyticsQueue.add("order-cancelled", {
        event:     "order-cancelled",
        userId:    userId.toString(),
        timestamp: Date.now(),
        data: {
          orderId: orderId.toString(),
          total:   order.totalSellingPrice,
        },
      });
    } catch (queueErr) {
      console.error("⚠️ Analytics queue error:", queueErr.message);
    }

    return await Order.findByIdAndUpdate(orderId, order, { new: true });
  }
}

module.exports = new OrderService();