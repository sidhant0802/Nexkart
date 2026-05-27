const Product        = require("../models/Product");
const ProductListing = require("../models/ProductListing");
const Category       = require("../models/Category");
const Seller         = require("../models/Seller");
const ProductService = require("../services/ProductService");
const { deleteCachePattern } = require("../config/redis");

const calculateDiscount = (mrp, selling) => {
  if (!mrp || mrp <= 0) return 0;
  return Math.round(((mrp - selling) / mrp) * 100);
};

// ✅ Helper — invalidate all product-related caches
const invalidateProductCache = async (productId = null) => {
  try {
    await Promise.all([
      deleteCachePattern("cache:/products*"),
      deleteCachePattern("cache:/home-page*"),
      deleteCachePattern("cache:/api/admin/products*"),
      deleteCachePattern("cache:/api/admin/analytics*"),
      productId ? deleteCachePattern(`cache:/products/${productId}*`) : null,
    ].filter(Boolean));
  } catch (err) {
    console.error("Cache invalidation error:", err.message);
  }
};

class AdminProductController {

  // ── Create product + listing ──
  async createProduct(req, res) {
    try {
      const data = req.body;

      let seller;
      if (data.sellerId) {
        seller = await Seller.findById(data.sellerId);
      } else {
        seller = await Seller.findOne({ accountStatus: "ACTIVE" });
      }

      if (!seller) {
        return res.status(400).json({
          error: "No active seller found. Please create a seller first.",
        });
      }

      const cat1 = await ProductService.createOrGetCategory(data.category,  1, null,     data.categoryName);
      const cat2 = await ProductService.createOrGetCategory(data.category2, 2, cat1._id, data.category2Name);
      const cat3 = await ProductService.createOrGetCategory(data.category3, 3, cat2._id, data.category3Name);

      if (!cat1.name) { cat1.name = data.categoryName  || data.category;  await cat1.save(); }
      if (!cat2.name) { cat2.name = data.category2Name || data.category2; await cat2.save(); }
      if (!cat3.name) { cat3.name = data.category3Name || data.category3; await cat3.save(); }

      let product = await Product.findOne({
        title: data.title.trim(),
        brand: (data.brand || "").toLowerCase().trim(),
      });

      if (!product) {
        product = new Product({
          category:    cat3._id,
          title:       data.title.trim(),
          description: data.description,
          color:       data.color,
          brand:       (data.brand || "").toLowerCase().trim(),
          images:      data.images || [],
          sizes:       data.sizes,
        });
        await product.save();
      }

      const existing = await ProductListing.findOne({
        product: product._id,
        seller:  seller._id,
      });
      if (existing) {
        return res.status(400).json({
          error: "This seller already has a listing for this product.",
        });
      }

      const listing = new ProductListing({
        product:         product._id,
        seller:          seller._id,
        mrpPrice:        data.mrpPrice,
        sellingPrice:    data.sellingPrice,
        discountPercent: calculateDiscount(data.mrpPrice, data.sellingPrice),
        quantity:        data.quantity     || 50,
        deliveryDays:    data.deliveryDays || 5,
        sellerRating:    4.5,
        isActive:        true,
      });
      await listing.save();

      await ProductService.recalculateProductAggregates(product._id);

      // ✅ INVALIDATE cache
      await invalidateProductCache(product._id);

      const populated = await Product.findById(product._id)
        .populate("category")
        .populate({ path: "defaultListing", populate: { path: "seller" } });

      console.log(`✅ Admin created product: ${product.title}`);
      return res.status(201).json(populated);
    } catch (error) {
      console.log("❌ Admin create product error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Get all products ──
  async getAllProducts(req, res) {
    try {
      const { category, brand } = req.query;
      const filter = {};

      if (brand) filter.brand = brand;

      if (category) {
        const cat = await Category.findOne({ categoryId: category });
        if (cat) {
          const subCats    = await Category.find({});
          const matchedIds = [cat._id];
          const level2     = subCats.filter(
            c => String(c.parentCategory) === String(cat._id)
          );
          level2.forEach(l2 => {
            matchedIds.push(l2._id);
            const level3 = subCats.filter(
              c => String(c.parentCategory) === String(l2._id)
            );
            level3.forEach(l3 => matchedIds.push(l3._id));
          });
          filter.category = { $in: matchedIds };
        }
      }

      const products = await Product.find(filter)
        .populate("category")
        .populate({
          path: "defaultListing",
          populate: { path: "seller", select: "sellerName businessDetails" },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json(products);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Update product fields ──
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const data   = req.body;

      const product = await Product.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      ).populate("category");

      if (!product) return res.status(404).json({ error: "Product not found" });

      // ✅ INVALIDATE cache
      await invalidateProductCache(id);

      console.log(`✏️  Product updated: ${product.title}`);
      return res.status(200).json(product);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Delete product + all listings ──
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await ProductListing.deleteMany({ product: id });
      const product = await Product.findByIdAndDelete(id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // ✅ INVALIDATE cache
      await invalidateProductCache(id);

      console.log(`🗑️  Product deleted: ${product.title}`);
      return res.status(200).json({ message: "Product deleted", id });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Stats ──
  async getProductStats(req, res) {
    try {
      const total         = await Product.countDocuments();
      const totalListings = await ProductListing.countDocuments({ isActive: true });

      const uniqueSellerIds    = await ProductListing.distinct("seller", { isActive: true });
      const totalUniqueSellers = uniqueSellerIds.length;

      const stockAgg = await ProductListing.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]);
      const totalStock = stockAgg[0]?.total ?? 0;

      const soldAgg = await ProductListing.aggregate([
        { $group: { _id: null, total: { $sum: "$totalSold" } } },
      ]);
      const totalSold = soldAgg[0]?.total ?? 0;

      const byBrand = await Product.aggregate([
        { $match: { brand: { $ne: "" } } },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const byCategory = await Product.aggregate([
        {
          $lookup: {
            from:         "categories",
            localField:   "category",
            foreignField: "_id",
            as:           "cat",
          },
        },
        { $unwind: "$cat" },
        { $group: { _id: "$cat.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const topMultiSeller = await Product.find({ totalSellers: { $gt: 1 } })
        .select("title brand totalSellers minPrice maxPrice")
        .sort({ totalSellers: -1 })
        .limit(5);

      return res.status(200).json({
        total,
        totalListings,
        totalUniqueSellers,
        totalStock,
        totalSold,
        avgSellersPerProduct: total > 0
          ? (totalListings / total).toFixed(1)
          : "0",
        topBrands: byBrand,
        byCategory,
        topMultiSeller,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ════════════════════════════════════════
  // SELLER LISTING MANAGEMENT
  // ════════════════════════════════════════

  async getProductListings(req, res) {
    try {
      const listings = await ProductListing.find({ product: req.params.id })
        .populate("seller", "sellerName businessDetails email accountStatus")
        .sort({ sellingPrice: 1 });
      return res.status(200).json(listings);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async addSellerListing(req, res) {
    try {
      const { sellerId, mrpPrice, sellingPrice, quantity, deliveryDays } = req.body;
      const productId = req.params.id;

      if (!sellerId || !mrpPrice || !sellingPrice) {
        return res.status(400).json({
          error: "sellerId, mrpPrice and sellingPrice are required",
        });
      }

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const seller = await Seller.findById(sellerId);
      if (!seller)  return res.status(404).json({ error: "Seller not found" });

      const existing = await ProductListing.findOne({
        product: productId,
        seller:  sellerId,
      });
      if (existing) {
        return res.status(400).json({
          error: "This seller already has a listing for this product",
        });
      }

      const listing = new ProductListing({
        product:         productId,
        seller:          sellerId,
        mrpPrice:        Number(mrpPrice),
        sellingPrice:    Number(sellingPrice),
        discountPercent: calculateDiscount(Number(mrpPrice), Number(sellingPrice)),
        quantity:        Number(quantity)     || 50,
        deliveryDays:    Number(deliveryDays) || 5,
        sellerRating:    4.5,
        isActive:        true,
      });
      await listing.save();

      await ProductService.recalculateProductAggregates(productId);

      // ✅ INVALIDATE cache
      await invalidateProductCache(productId);

      const populated = await ProductListing.findById(listing._id)
        .populate("seller", "sellerName businessDetails email");

      console.log(`✅ Admin added seller ${seller.sellerName} to ${product.title}`);
      return res.status(201).json(populated);
    } catch (error) {
      console.log("❌ addSellerListing error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  async updateListing(req, res) {
    try {
      const { listingId } = req.params;
      const { mrpPrice, sellingPrice, quantity, deliveryDays, isActive } = req.body;

      const listing = await ProductListing.findById(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      if (mrpPrice     !== undefined) listing.mrpPrice     = Number(mrpPrice);
      if (sellingPrice !== undefined) listing.sellingPrice = Number(sellingPrice);
      if (quantity     !== undefined) listing.quantity     = Number(quantity);
      if (deliveryDays !== undefined) listing.deliveryDays = Number(deliveryDays);
      if (isActive     !== undefined) listing.isActive     = isActive;

      if (listing.mrpPrice > 0) {
        listing.discountPercent = calculateDiscount(
          listing.mrpPrice,
          listing.sellingPrice
        );
      }

      await listing.save();
      await ProductService.recalculateProductAggregates(listing.product);

      // ✅ INVALIDATE cache
      await invalidateProductCache(listing.product);

      const populated = await ProductListing.findById(listingId)
        .populate("seller", "sellerName businessDetails email");

      console.log(`✏️  Listing updated: ${listingId}`);
      return res.status(200).json(populated);
    } catch (error) {
      console.log("❌ updateListing error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteListing(req, res) {
    try {
      const { listingId } = req.params;
      const listing = await ProductListing.findById(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      const productId = listing.product;
      await ProductListing.findByIdAndDelete(listingId);
      await ProductService.recalculateProductAggregates(productId);

      // ✅ INVALIDATE cache
      await invalidateProductCache(productId);

      console.log(`🗑️  Listing deleted: ${listingId}`);
      return res.status(200).json({ message: "Listing removed", listingId });
    } catch (error) {
      console.log("❌ deleteListing error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllSellers(req, res) {
    try {
      const sellers = await Seller.find({ accountStatus: "ACTIVE" })
        .select("sellerName businessDetails email")
        .sort({ sellerName: 1 });
      return res.status(200).json(sellers);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AdminProductController();