const Order        = require("../models/Order");
const OrderItem    = require("../models/OrderItem");
const OrderStatus  = require("../domain/OrderStatus");
const mongoose     = require("mongoose");

class RevenueService {

  async getRevenueChartByType(type, sellerId) {
    const now = new Date();
    let startDate, groupFormat;

    switch (type) {
      case "weekly":
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupFormat = "%Y-%m-%d";
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        groupFormat = "%Y-%m";
        break;
      case "yearly":
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        groupFormat = "%Y";
        break;
      case "daily":
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupFormat = "%Y-%m-%d";
    }

    const results = await Order.aggregate([
      {
        $match: {
          seller:      new mongoose.Types.ObjectId(sellerId),
          orderStatus: { $in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY] },
          createdAt:   { $gte: startDate },
        },
      },
      {
        $group: {
          _id:     { $dateToString: { format: groupFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalSellingPrice" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
    ]);

    return results;
  }

  async getDashboardStats(sellerId) {
    const sId        = new mongoose.Types.ObjectId(sellerId);
    const now        = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Today's revenue
    const todayAgg = await Order.aggregate([
      {
        $match: {
          seller:      sId,
          createdAt:   { $gte: todayStart },
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id:     null,
          revenue: { $sum: "$totalSellingPrice" },
          orders:  { $sum: 1 },
        },
      },
    ]);

    // Monthly revenue
    const monthAgg = await Order.aggregate([
      {
        $match: {
          seller:      sId,
          createdAt:   { $gte: monthStart },
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id:     null,
          revenue: { $sum: "$totalSellingPrice" },
          orders:  { $sum: 1 },
        },
      },
    ]);

    // Total all-time
    const totalAgg = await Order.aggregate([
      {
        $match: {
          seller:      sId,
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id:     null,
          revenue: { $sum: "$totalSellingPrice" },
          orders:  { $sum: 1 },
        },
      },
    ]);

    // ✅ Pending orders (needs attention)
    const pendingCount = await Order.countDocuments({
      seller:      sId,
      orderStatus: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
    });

    // ✅ In-process orders (shipped/packed/out for delivery)
    const inProcessCount = await Order.countDocuments({
      seller:      sId,
      orderStatus: { $in: [
        OrderStatus.PACKED,
        OrderStatus.SHIPPED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.PROCESSING,
      ]},
    });

    // ✅ Total orders count
    const totalOrdersCount = await Order.countDocuments({
      seller: sId,
    });

    // Top selling products
    const topProducts = await OrderItem.aggregate([
      { $match: { seller: sId } },
      {
        $group: {
          _id:       "$product",
          totalSold: { $sum: "$quantity" },
          revenue:   { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         "products",
          localField:   "_id",
          foreignField: "_id",
          as:           "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id:       1,
          totalSold: 1,
          revenue:   1,
          title:     "$product.title",
          image:     { $arrayElemAt: ["$product.images", 0] },
        },
      },
    ]);

    return {
      today: {
        revenue: todayAgg[0]?.revenue || 0,
        orders:  todayAgg[0]?.orders  || 0,
      },
      month: {
        revenue: monthAgg[0]?.revenue || 0,
        orders:  monthAgg[0]?.orders  || 0,
      },
      total: {
        revenue: totalAgg[0]?.revenue || 0,
        orders:  totalAgg[0]?.orders  || 0,
      },
      pendingOrders:  pendingCount,
      inProcess:      inProcessCount,   // ✅ NEW
      totalOrders:    totalOrdersCount, // ✅ NEW
      topProducts,
    };
  }
}

module.exports = new RevenueService();