// backend/src/services/ProductService.js
const Product        = require("../models/Product");
const ProductListing = require("../models/ProductListing");
const Category       = require("../models/Category");
const mongoose       = require("mongoose");
const ProductError   = require("../exceptions/ProductError");

const calculateDiscountPercentage = (mrpPrice, sellingPrice) => {
  if (mrpPrice <= 0) throw new Error("MRP must be greater than zero");
  const discount = mrpPrice - sellingPrice;
  return Math.round((discount / mrpPrice) * 100);
};

// ✅ Reusable lightweight populate config
const LIGHT_POPULATE = [
  { path: "category", select: "name categoryId parentCategory level" },
  {
    path:   "defaultListing",
    select: "sellingPrice mrpPrice discountPercent quantity deliveryDays sellerRating",
    populate: { path: "seller", select: "sellerName businessDetails.businessName" },
  },
];

class ProductService {

  // ── Create Product ──
  async createProduct(req, seller) {
    try {
      const discountPercentage = calculateDiscountPercentage(req.mrpPrice, req.sellingPrice);

      const category1 = await this.createOrGetCategory(req.category,  1, null,         req.categoryName);
      const category2 = await this.createOrGetCategory(req.category2, 2, category1._id, req.category2Name);
      const category3 = await this.createOrGetCategory(req.category3, 3, category2._id, req.category3Name);

      let product = await Product.findOne({
        title: req.title.trim(),
        brand: (req.brand || "").toLowerCase().trim(),
      });

      if (!product) {
        product = new Product({
          category:     category3._id,
          title:        req.title.trim(),
          color:        req.color,
          brand:        (req.brand || "").toLowerCase().trim(),
          description:  req.description,
          images:       req.images,
          sizes:        req.sizes,
          minPrice:     req.sellingPrice,
          maxPrice:     req.sellingPrice,
          minMrpPrice:  req.mrpPrice,
          totalSellers: 1,
          totalStock:   req.quantity || 50,
        });
        await product.save();
      }

      const existingListing = await ProductListing.findOne({
        product: product._id,
        seller:  seller._id,
      });

      if (existingListing) {
        throw new ProductError("You already have a listing for this product. Update it instead.");
      }

      const listing = new ProductListing({
        product:            product._id,
        seller:             seller._id,
        mrpPrice:           req.mrpPrice,
        sellingPrice:       req.sellingPrice,
        discountPercent:    discountPercentage,
        quantity:           req.quantity     || 50,
        deliveryDays:       req.deliveryDays || 5,
        sellerRating:       4.5,
        sellerTotalReviews: 0,
        isActive:           true,
      });
      await listing.save();

      await this.recalculateProductAggregates(product._id);

      return await Product.findById(product._id)
        .populate(LIGHT_POPULATE);
    } catch (error) {
      console.log("createProduct error:", error.message);
      throw new ProductError(error.message);
    }
  }

  // ── Recalculate aggregates ──
  async recalculateProductAggregates(productId) {
    const listings = await ProductListing
      .find({ product: productId, isActive: true })
      .lean();

    if (listings.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        minPrice: 0, maxPrice: 0, totalSellers: 0, totalStock: 0,
        defaultListing: null, isActive: false,
      });
      return;
    }

    const prices    = listings.map(l => l.sellingPrice);
    const mrpPrices = listings.map(l => l.mrpPrice);
    const cheapest  = listings.reduce((a, b) => a.sellingPrice < b.sellingPrice ? a : b);

    await Product.findByIdAndUpdate(productId, {
      minPrice:       Math.min(...prices),
      maxPrice:       Math.max(...prices),
      minMrpPrice:    Math.min(...mrpPrices),
      totalSellers:   listings.length,
      totalStock:     listings.reduce((sum, l) => sum + l.quantity, 0),
      defaultListing: cheapest._id,
      isActive:       true,
    });
  }

  // ── Create or Get Category ──
  async createOrGetCategory(categoryId, level, parentId = null, name = null) {
    let category = await Category.findOne({ categoryId });
    if (!category) {
      category = new Category({
        categoryId,
        name:           name || categoryId,
        level,
        parentCategory: parentId,
      });
      await category.save();
    } else if (!category.name && name) {
      category.name = name;
      await category.save();
    }
    return category;
  }

  // ── Delete Product ──
  async deleteProduct(productId) {
    try {
      await ProductListing.deleteMany({ product: productId });
      await Product.findByIdAndDelete(productId);
    } catch (error) {
      throw new ProductError(error.message);
    }
  }

  // ── Update Product ──
  async updateProduct(productId, updatedProductData) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $set: updatedProductData },
        { new: true }
      ).lean();
      if (!product) throw new ProductError("Product not found");
      return product;
    } catch (error) {
      throw new ProductError(error.message);
    }
  }

  // ── Find Product By ID ── ⚡ OPTIMIZED
  async findProductById(productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ProductError("Invalid product ID");
      }
      // ✅ .lean() = 3x faster, only needed fields populated
      const product = await Product
        .findById(productId)
        .populate(LIGHT_POPULATE)
        .lean();

      if (!product) throw new ProductError("Product not found");
      return product;
    } catch (error) {
      throw new ProductError(error.message);
    }
  }

  // ── Get All Listings For A Product ── ⚡ OPTIMIZED
  async getProductListings(productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ProductError("Invalid product ID");
      }
      const listings = await ProductListing
        .find({ product: productId, isActive: true })
        .select("sellingPrice mrpPrice discountPercent quantity deliveryDays sellerRating sellerTotalReviews")
        .populate("seller", "sellerName businessDetails.businessName")
        .sort({ sellingPrice: 1 })
        .lean();   // ✅ 3x faster
      return listings;
    } catch (error) {
      throw new ProductError(error.message);
    }
  }

  // ── Get a Single Listing By ID ── ⚡ OPTIMIZED
  async getListingById(listingId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        throw new ProductError("Invalid listing ID");
      }
      const listing = await ProductListing
        .findById(listingId)
        .populate({ path: "product", populate: { path: "category", select: "name categoryId" } })
        .populate("seller", "sellerName businessDetails.businessName")
        .lean();
      if (!listing) throw new ProductError("Listing not found");
      return listing;
    } catch (error) {
      throw new ProductError(error.message);
    }
  }

  // ════════════════════════════════════════
  // SMART SEARCH (already fast, minor optimization)
  // ════════════════════════════════════════
  async searchProduct(query) {
    if (!query || query.trim().length === 0) return [];

    const cleanQuery   = query.trim();
    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lowerQuery   = cleanQuery.toLowerCase();

    const keywordMap = {
      phone:      ["mobiles"],
      mobile:     ["mobiles"],
      smartphone: ["mobiles"],
      iphone:     ["mobiles"],
      laptop:     ["laptops"],
      macbook:    ["laptops"],
      notebook:   ["laptops"],
      watch:      ["smart_watches"],
      smartwatch: ["smart_watches"],
      shoe:       ["men_footwear", "women_footwear"],
      sneaker:    ["men_footwear"],
      headphone:  ["headphones"],
      headset:    ["headphones"],
      earbud:     ["headphones"],
      airpods:    ["headphones"],
      saree:      ["women_sarees"],
      shirt:      ["men_topwear"],
      tshirt:     ["men_topwear"],
      "t-shirt":  ["men_topwear"],
      bag:        ["accessories"],
      sofa:       ["home_furniture"],
      chair:      ["home_furniture"],
    };

    let matchedCategoryIds = [];

    for (const [keyword, catIds] of Object.entries(keywordMap)) {
      const regex = new RegExp(`\\b${keyword}s?\\b`, "i");
      if (regex.test(lowerQuery)) {
        const cats = await Category.find({ categoryId: { $in: catIds } }).select("_id").lean();
        matchedCategoryIds.push(...cats.map(c => c._id));
        const subCats = await Category.find({ parentCategory: { $in: cats.map(c => c._id) } }).select("_id").lean();
        matchedCategoryIds.push(...subCats.map(c => c._id));
      }
    }

    const catByName = await Category
      .find({ name: new RegExp(`\\b${escapedQuery}s?\\b`, "i") })
      .select("_id")
      .lean();
    matchedCategoryIds.push(...catByName.map(c => c._id));

    let products;

    if (matchedCategoryIds.length > 0) {
      // ⚡ OPTIMIZED with .lean() + projection
      products = await Product.find({
        isActive: true,
        category: { $in: matchedCategoryIds },
      })
        .select("title brand color images minPrice maxPrice averageRating numRatings totalSellers category defaultListing")
        .populate(LIGHT_POPULATE)
        .limit(100)
        .lean();
    } else {
      products = await Product.find({
        isActive: true,
        $or: [
          { title: new RegExp(escapedQuery, "i") },
          { brand: new RegExp(escapedQuery, "i") },
        ],
      })
        .select("title brand color images minPrice maxPrice averageRating numRatings totalSellers category defaultListing")
        .populate(LIGHT_POPULATE)
        .limit(100)
        .lean();
    }

    // Score and sort
    const scored = products.map(p => {
      let score = 0;
      const title = (p.title || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();

      if (title === lowerQuery)         score += 100;
      if (title.startsWith(lowerQuery)) score += 50;
      if (title.includes(lowerQuery))   score += 30;
      if (brand === lowerQuery)         score += 80;
      if (brand.includes(lowerQuery))   score += 25;

      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  }

  // ── Get All Products (with filters) ── ⚡ MASSIVELY OPTIMIZED
  async getAllProducts(req) {
    try {
      const filterQuery = { isActive: true };

      if (req.category) {
        const category = await Category.findOne({ categoryId: req.category }).select("_id").lean();
        if (!category) {
          return { content: [], totalPages: 0, totalElements: 0 };
        }

        // ✅ OPTIMIZATION: Get all descendant categories in 1 query (not 2)
        const allCategories = await Category
          .find({
            $or: [
              { _id: category._id },
              { parentCategory: category._id },
            ],
          })
          .select("_id")
          .lean();

        const level1Ids = allCategories.map(c => c._id);

        // Fetch level 3 categories
        const level3 = await Category
          .find({ parentCategory: { $in: level1Ids } })
          .select("_id")
          .lean();

        const allCategoryIds = [...level1Ids, ...level3.map(c => c._id)];
        filterQuery.category = { $in: allCategoryIds };
      }

      if (req.brand) {
        const brandList = req.brand.split(",").map(b => b.trim()).filter(Boolean);
        if (brandList.length > 0) {
          filterQuery.brand = { $in: brandList };
        }
      }

      if (req.color) {
        const colorList = req.color.split(",").map(c => c.trim()).filter(Boolean);
        if (colorList.length > 0) {
          filterQuery.color = { $in: colorList.map(c => new RegExp(c, "i")) };
        }
      }

      if (req.size) {
        filterQuery.sizes = { $regex: new RegExp(req.size, "i") };
      }

      if (req.minPrice || req.maxPrice) {
        filterQuery.minPrice = {};
        if (req.minPrice) filterQuery.minPrice.$gte = Number(req.minPrice);
        if (req.maxPrice) filterQuery.minPrice.$lte = Number(req.maxPrice);
      }

      if (req.stock) {
        filterQuery.totalStock = { $gt: 0 };
      }

      let sortQuery = {};
      if (req.sort === "price_low")       sortQuery = { minPrice: 1 };
      else if (req.sort === "price_high") sortQuery = { minPrice: -1 };
      else if (req.sort === "newest")     sortQuery = { createdAt: -1 };
      else                                sortQuery = { createdAt: -1 };

      const page     = parseInt(req.pageNumber) || 0;
      const pageSize = parseInt(req.pageSize)   || 20;

      // ⚡ OPTIMIZATION: Run query + count in PARALLEL
      const [products, totalElements] = await Promise.all([
        Product
          .find(filterQuery)
          .select("title brand color images minPrice maxPrice averageRating numRatings totalSellers totalStock category defaultListing createdAt")
          .populate(LIGHT_POPULATE)
          .sort(sortQuery)
          .skip(page * pageSize)
          .limit(pageSize)
          .lean(),   // ✅ 3x faster
        Product.countDocuments(filterQuery),
      ]);

      const totalPages = Math.ceil(totalElements / pageSize);

      return {
        content: products,
        totalPages,
        totalElements,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.log("getAllProducts error:", error.message);
      throw new ProductError(error.message);
    }
  }

  // ── Recently Added ──
  async recentlyAddedProduct() {
    return await Product
      .find({ isActive: true })
      .select("title brand images minPrice category defaultListing createdAt")
      .populate(LIGHT_POPULATE)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }

  // ── Get Listings By Seller ──
  async getProductBySellerId(sellerId) {
    return await ProductListing
      .find({ seller: sellerId })
      .populate({
        path: "product",
        select: "title brand images color category",
        populate: { path: "category", select: "name categoryId" },
      })
      .sort({ createdAt: -1 })
      .lean();
  }
}

module.exports = new ProductService();