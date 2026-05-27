const mongoose       = require("mongoose");
const Order          = require("../models/Order");
const OrderItem      = require("../models/OrderItem");
const Product        = require("../models/Product");
const ProductListing = require("../models/ProductListing");
const Seller         = require("../models/Seller");
const Category       = require("../models/Category");

class AdminAnalyticsController {

  // ══════════════════════════════════════════════════════
  // 1. STOCK SOLD — by product, by seller
  // ══════════════════════════════════════════════════════
  async getStockSold(req, res) {
    try {
      const { search = "", page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const pipeline = [
        // Join with product
        {
          $lookup: {
            from:         "products",
            localField:   "product",
            foreignField: "_id",
            as:           "productData",
          },
        },
        { $unwind: "$productData" },

        // Join with seller
        {
          $lookup: {
            from:         "sellers",
            localField:   "seller",
            foreignField: "_id",
            as:           "sellerData",
          },
        },
        { $unwind: "$sellerData" },

        // Join with productlisting for current stock
        {
          $lookup: {
            from: "productlistings",
            let:  { pid: "$product", sid: "$seller" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$product", "$$pid"] },
                      { $eq: ["$seller",  "$$sid"] },
                    ],
                  },
                },
              },
              { $project: { quantity: 1, sellingPrice: 1, mrpPrice: 1 } },
            ],
            as: "listingData",
          },
        },

        // Group by product + seller
        {
          $group: {
            _id: {
              product: "$product",
              seller:  "$seller",
            },
            productTitle:  { $first: "$productData.title" },
            productImages: { $first: "$productData.images" },
            productBrand:  { $first: "$productData.brand" },
            sellerName:    { $first: "$sellerData.sellerName" },
            businessName:  { $first: "$sellerData.businessDetails.businessName" },
            sellerEmail:   { $first: "$sellerData.email" },
            totalSold:     { $sum: "$quantity" },
            totalRevenue:  { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
            currentStock:  { $first: { $arrayElemAt: ["$listingData.quantity",      0] } },
            sellingPrice:  { $first: { $arrayElemAt: ["$listingData.sellingPrice",  0] } },
            mrpPrice:      { $first: { $arrayElemAt: ["$listingData.mrpPrice",      0] } },
          },
        },

        // Optional search filter
        ...(search
          ? [{
              $match: {
                $or: [
                  { productTitle: { $regex: search, $options: "i" } },
                  { sellerName:   { $regex: search, $options: "i" } },
                  { businessName: { $regex: search, $options: "i" } },
                  { productBrand: { $regex: search, $options: "i" } },
                ],
              },
            }]
          : []),

        { $sort: { totalSold: -1 } },

        // Facet for pagination + total count
        {
          $facet: {
            data: [
              { $skip:  skip            },
              { $limit: Number(limit)   },
              {
                $project: {
                  _id:          0,
                  productId:    "$_id.product",
                  sellerId:     "$_id.seller",
                  productTitle: 1,
                  productImage: { $arrayElemAt: ["$productImages", 0] },
                  productBrand: 1,
                  sellerName:   1,
                  businessName: 1,
                  sellerEmail:  1,
                  totalSold:    1,
                  totalRevenue: 1,
                  currentStock: { $ifNull: ["$currentStock", 0] },
                  sellingPrice: { $ifNull: ["$sellingPrice", 0] },
                  mrpPrice:     { $ifNull: ["$mrpPrice",     0] },
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const [result] = await OrderItem.aggregate(pipeline);

      // Summary stats
      const [summary] = await OrderItem.aggregate([
        {
          $group: {
            _id:            null,
            totalUnitsSold: { $sum: "$quantity" },
            totalRevenue:   { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
          },
        },
      ]);

      return res.status(200).json({
        data:           result?.data                   ?? [],
        total:          result?.totalCount?.[0]?.count ?? 0,
        page:           Number(page),
        limit:          Number(limit),
        totalUnitsSold: summary?.totalUnitsSold        ?? 0,
        totalRevenue:   summary?.totalRevenue          ?? 0,
      });

    } catch (err) {
      console.error("getStockSold error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ══════════════════════════════════════════════════════
  // 2. SELLER REVENUE — top 5 + others for pie chart
  // ══════════════════════════════════════════════════════
  async getSellerRevenue(req, res) {
    try {
      const { period = "all" } = req.query;

      // Date filter
      let dateMatch = {};
      const now = new Date();
      if (period === "week") {
        dateMatch = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
      } else if (period === "month") {
        dateMatch = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
      } else if (period === "year") {
        dateMatch = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
      }

      const pipeline = [
        {
          $match: {
            ...dateMatch,
            orderStatus: { $nin: ["CANCELLED"] },
          },
        },
        {
          $group: {
            _id:     "$seller",
            revenue: { $sum: "$totalSellingPrice" },
            orders:  { $sum: 1 },
          },
        },
        {
          $lookup: {
            from:         "sellers",
            localField:   "_id",
            foreignField: "_id",
            as:           "sellerInfo",
          },
        },
        // ✅ FIXED: preserveNullAndEmptyArrays (not preserveNullAndEmpty)
        { $unwind: { path: "$sellerInfo", preserveNullAndEmptyArrays: true } },
        { $sort: { revenue: -1 } },
        {
          $project: {
            _id:          0,
            sellerId:     "$_id",
            sellerName:   "$sellerInfo.sellerName",
            businessName: "$sellerInfo.businessDetails.businessName",
            email:        "$sellerInfo.email",
            revenue:      1,
            orders:       1,
          },
        },
      ];

      const allSellers = await Order.aggregate(pipeline);

      if (allSellers.length === 0) {
        return res.status(200).json({
          sellers:      [],
          totalRevenue: 0,
          period,
          othersCount:  0,
          trend:        [],
        });
      }

      // Top 5 + "Others"
      const top5          = allSellers.slice(0, 5);
      const others        = allSellers.slice(5);
      const totalRevenue  = allSellers.reduce((s, x) => s + x.revenue, 0);
      const othersRevenue = others.reduce((s, x) => s + x.revenue, 0);
      const othersOrders  = others.reduce((s, x) => s + x.orders,  0);

      const chartData = [
        ...top5.map((s, i) => ({
          ...s,
          percentage: totalRevenue > 0
            ? parseFloat(((s.revenue / totalRevenue) * 100).toFixed(1))
            : 0,
          rank: i + 1,
        })),
        ...(others.length > 0
          ? [{
              sellerId:     "others",
              sellerName:   "Others",
              businessName: `${others.length} more sellers`,
              revenue:      othersRevenue,
              orders:       othersOrders,
              percentage:   totalRevenue > 0
                ? parseFloat(((othersRevenue / totalRevenue) * 100).toFixed(1))
                : 0,
              rank: 6,
            }]
          : []),
      ];

      // Monthly trend for top 5 sellers
      const top5Ids = top5.map(s => s.sellerId);
      const trendPipeline = [
        {
          $match: {
            seller:      { $in: top5Ids },
            orderStatus: { $nin: ["CANCELLED"] },
            createdAt:   { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          },
        },
        {
          $group: {
            _id: {
              seller: "$seller",
              month:  { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            },
            revenue: { $sum: "$totalSellingPrice" },
          },
        },
        { $sort: { "_id.month": 1 } },
      ];
      const trend = await Order.aggregate(trendPipeline);

      return res.status(200).json({
        sellers:      chartData,
        totalRevenue,
        period,
        othersCount:  others.length,
        trend,
      });

    } catch (err) {
      console.error("getSellerRevenue error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ══════════════════════════════════════════════════════
  // 3. PRODUCT ANALYTICS — what users buy, category prefs
  // ══════════════════════════════════════════════════════
  async getProductAnalytics(req, res) {
    try {
      const { period = "month" } = req.query;
      const now = new Date();

      let dateFilter = {};
      if (period === "week") {
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
      } else if (period === "month") {
        dateFilter = {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
        };
      } else if (period === "year") {
        dateFilter = { createdAt: { $gte: new Date(now.getFullYear() - 1, 0, 1) } };
      }

      // ── Top selling products ──
      const topProductsPipeline = [
        { $match: dateFilter },
        {
          $group: {
            _id:          "$product",
            totalSold:    { $sum: "$quantity" },
            totalRevenue: { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
            avgPrice:     { $avg: "$sellingPrice" },
            orderCount:   { $sum: 1 },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
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
          $lookup: {
            from:         "categories",
            localField:   "product.category",
            foreignField: "_id",
            as:           "category",
          },
        },
        // ✅ FIXED
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id:          0,
            productId:    "$_id",
            title:        "$product.title",
            brand:        "$product.brand",
            image:        { $arrayElemAt: ["$product.images", 0] },
            categoryName: "$category.name",
            totalSold:    1,
            totalRevenue: 1,
            avgPrice:     { $round: ["$avgPrice", 2] },
            orderCount:   1,
            rating:       "$product.averageRating",
            numRatings:   "$product.numRatings",
          },
        },
      ];
      const topProducts = await OrderItem.aggregate(topProductsPipeline);

      // ── Category breakdown ──
      const categoryPipeline = [
        { $match: dateFilter },
        {
          $lookup: {
            from:         "products",
            localField:   "product",
            foreignField: "_id",
            as:           "prod",
          },
        },
        { $unwind: "$prod" },
        {
          $lookup: {
            from:         "categories",
            localField:   "prod.category",
            foreignField: "_id",
            as:           "cat",
          },
        },
        // ✅ FIXED
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id:            "$cat.name",
            totalSold:      { $sum: "$quantity" },
            totalRevenue:   { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
            uniqueProducts: { $addToSet: "$product" },
            orderCount:     { $sum: 1 },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { totalSold: -1 } },
        { $limit: 8 },
        {
          $project: {
            _id:          0,
            categoryName: "$_id",
            totalSold:    1,
            totalRevenue: 1,
            productCount: { $size: "$uniqueProducts" },
            orderCount:   1,
          },
        },
      ];
      const categoryBreakdown = await OrderItem.aggregate(categoryPipeline);

      // ── Brand preferences ──
      const brandPipeline = [
        { $match: dateFilter },
        {
          $lookup: {
            from:         "products",
            localField:   "product",
            foreignField: "_id",
            as:           "prod",
          },
        },
        { $unwind: "$prod" },
        {
          $group: {
            _id:          "$prod.brand",
            totalSold:    { $sum: "$quantity" },
            totalRevenue: { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
            orderCount:   { $sum: 1 },
          },
        },
        { $match: { _id: { $nin: [null, ""] } } },
        { $sort: { totalSold: -1 } },
        { $limit: 8 },
        {
          $project: {
            _id:          0,
            brand:        "$_id",
            totalSold:    1,
            totalRevenue: 1,
            orderCount:   1,
          },
        },
      ];
      const brandPreferences = await OrderItem.aggregate(brandPipeline);

      // ── Price range distribution ──
      const priceRangePipeline = [
        { $match: dateFilter },
        {
          $bucket: {
            groupBy:    "$sellingPrice",
            boundaries: [0, 500, 1000, 2000, 5000, 10000, 50000],
            default:    "50000+",
            output: {
              count:   { $sum: 1 },
              revenue: { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
              units:   { $sum: "$quantity" },
            },
          },
        },
      ];
      const priceDistribution = await OrderItem.aggregate(priceRangePipeline);

      // ── Daily order trend (last 30 days) ──
      const trendPipeline = [
        {
          $match: {
            createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            units:   { $sum: "$quantity" },
            revenue: { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id:     0,
            date:    "$_id",
            units:   1,
            revenue: 1,
            orders:  1,
          },
        },
      ];
      const dailyTrend = await OrderItem.aggregate(trendPipeline);

      // ── Summary ──
      const [summary] = await OrderItem.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id:            null,
            totalUnits:     { $sum: "$quantity" },
            totalRevenue:   { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
            totalOrders:    { $sum: 1 },
            avgOrderValue:  { $avg: { $multiply: ["$sellingPrice", "$quantity"] } },
            uniqueProducts: { $addToSet: "$product" },
          },
        },
        {
          $project: {
            _id:            0,
            totalUnits:     1,
            totalRevenue:   1,
            totalOrders:    1,
            avgOrderValue:  { $round: ["$avgOrderValue", 2] },
            uniqueProducts: { $size: "$uniqueProducts" },
          },
        },
      ]);

      return res.status(200).json({
        period,
        summary:           summary          ?? {},
        topProducts,
        categoryBreakdown,
        brandPreferences,
        priceDistribution,
        dailyTrend,
      });

    } catch (err) {
      console.error("getProductAnalytics error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ══════════════════════════════════════════════════════
  // 4. NEW SELLER NOTIFICATIONS
  // ══════════════════════════════════════════════════════
  async getNewSellers(req, res) {
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const newSellers = await Seller.find({ createdAt: { $gte: since } })
        .select(
          "sellerName email mobile businessDetails accountStatus createdAt isEmailVerified"
        )
        .sort({ createdAt: -1 })
        .limit(50);

      const pendingCount = await Seller.countDocuments({
        accountStatus: "PENDING_VERIFICATION",
      });

      return res.status(200).json({
        notifications: newSellers,
        pendingCount,
        total:         newSellers.length,
      });

    } catch (err) {
      console.error("getNewSellers error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Mark seller seen / activate ──
  async markSellerSeen(req, res) {
    try {
      const { id } = req.params;
      const seller  = await Seller.findByIdAndUpdate(
        id,
        { accountStatus: "ACTIVE" },
        { new: true }
      );
      if (!seller) return res.status(404).json({ error: "Seller not found" });
      return res.status(200).json({ message: "Seller activated", seller });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AdminAnalyticsController();