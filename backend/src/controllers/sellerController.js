// backend/src/controllers/sellerController.js
const bcrypt               = require("bcrypt");
const UserRoles            = require("../domain/UserRole");
const AccountStatus        = require("../domain/AccountStatus");
const SellerError          = require("../exceptions/SellerError");
const Seller               = require("../models/Seller");
const VerificationCode     = require("../models/VerificationCode");
const SellerService        = require("../services/SellerService");
const VerificationService  = require("../services/VerificationService");
const generateOTP          = require("../utils/generateOtp");
const jwtProvider          = require("../utils/jwtProvider");

// ✅ NEW — Import queues (replaces direct email sending)
const { emailQueue, notificationQueue } = require("../queues/queueConfig");

class SellerController {

  // ── Get seller profile ──
  async getSellerProfile(req, res) {
    try {
      const jwt    = req.headers.authorization.split(" ")[1];
      const seller = await SellerService.getSellerProfile(jwt);
      res.status(200).json(seller);
    } catch (err) {
      res.status(err instanceof SellerError ? 404 : 500).json({ message: err.message });
    }
  }

  // ── Create seller ── ✅ Uses queue
  async createSeller(req, res) {
    try {
      const newSeller = await SellerService.createSeller(req.body);

      const otp = generateOTP();
      await VerificationService.createVerificationCode(otp, req.body.email);

      // ✅ Queue welcome email (non-blocking!)
      await emailQueue.add("seller-welcome", {
        type: "seller-welcome",
        to:   req.body.email,
        data: {
          sellerName: req.body.sellerName,
          otp:        otp,
        },
      });

      // ✅ Notify admin about new seller registration
      await notificationQueue.add("admin-new-seller", {
        type: "new-seller",
        data: {
          sellerId:   newSeller._id,
          sellerName: req.body.sellerName,
          email:      req.body.email,
        },
      });

      return res.status(201).json({
        message:  "Seller created successfully. Verification email sent.",
        sellerId: newSeller._id,
      });

    } catch (err) {
      res.status(err instanceof SellerError ? 400 : 500).json({ error: err.message });
    }
  }

  // ── Get seller by id ──
  async getSellerById(req, res) {
    try {
      const seller = await SellerService.getSellerById(req.params.id);
      res.status(200).json(seller);
    } catch (err) {
      res.status(err instanceof SellerError ? 404 : 500).json({ message: err.message });
    }
  }

  // ── Get all sellers (admin) ──
  async getAllSellers(req, res) {
    try {
      const { status } = req.query;
      const sellers    = await SellerService.getAllSellers(status);
      res.status(200).json(sellers);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ── Update seller profile ──
  async updateSeller(req, res) {
    try {
      const seller = req.seller;
      const updatedSeller = await SellerService.updateSeller(seller, req.body);
      res.status(200).json(updatedSeller);
    } catch (err) {
      res.status(err instanceof SellerError ? 404 : 500).json({ message: err.message });
    }
  }

  // ── Delete seller ──
  async deleteSeller(req, res) {
    try {
      await SellerService.deleteSeller(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(err instanceof SellerError ? 404 : 500).json({ message: err.message });
    }
  }

  // ── Verify email ──
  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;
      const seller = await SellerService.verifyEmail(email, otp);
      res.status(200).json(seller);
    } catch (err) {
      res.status(err instanceof SellerError ? 404 : 500).json({ message: err.message });
    }
  }

  // ── Admin: update seller account status ── ✅ Sends approval email via queue
  async updateSellerAccountStatus(req, res) {
    try {
      const updatedSeller = await SellerService.updateSellerAccountStatus(
        req.params.id,
        req.params.status
      );

      // ✅ Send approval email if newly activated
      if (req.params.status === "ACTIVE") {
        await emailQueue.add("seller-approved", {
          type: "seller-approved",
          to:   updatedSeller.email,
          data: { sellerName: updatedSeller.sellerName },
        });
      }

      res.status(200).json(updatedSeller);
    } catch (err) {
      res.status(err instanceof SellerError ? 404 : 500).json({ message: err.message });
    }
  }

  // ── Send login OTP to seller email ── ✅ Uses queue
  async sendLoginOtp(req, res) {
    try {
      const { email } = req.body;

      const seller = await Seller.findOne({ email });
      if (!seller) {
        return res.status(404).json({ message: "No seller found with this email" });
      }

      if ([AccountStatus.BANNED, AccountStatus.CLOSED].includes(seller.accountStatus)) {
        return res.status(403).json({
          message: `Account is ${seller.accountStatus}. Contact support.`,
        });
      }

      await VerificationCode.deleteMany({ email });
      const otp = generateOTP();
      await VerificationService.createVerificationCode(otp, email);

      // ✅ Queue OTP email (instant response to user!)
      await emailQueue.add("login-otp", {
        type: "send-otp",
        to:   email,
        data: { otp },
      });

      return res.status(200).json({ message: "OTP sent successfully", email });

    } catch (err) {
      console.error("Send login OTP error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Verify login OTP ──
  async verifyLoginOtp(req, res) {
    try {
      const { otp, email } = req.body;

      const seller = await Seller.findOne({ email });
      if (!seller) {
        return res.status(404).json({ message: "No seller found with this email" });
      }

      const verificationCode = await VerificationCode.findOne({ email });
      if (!verificationCode || verificationCode.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (seller.accountStatus === AccountStatus.BANNED) {
        return res.status(403).json({ message: "Your account is banned." });
      }
      if (seller.accountStatus === AccountStatus.CLOSED) {
        return res.status(403).json({ message: "Your account is closed." });
      }

      await VerificationCode.deleteOne({ _id: verificationCode._id });

      const token = jwtProvider.createJwt({ email });

      return res.status(200).json({
        message:       "Login Success",
        jwt:           token,
        role:          UserRoles.SELLER,
        accountStatus: seller.accountStatus,
        sellerName:    seller.sellerName,
      });
    } catch (err) {
      console.error("Verify login OTP error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Login with password ──
  async loginWithPassword(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const seller = await Seller.findOne({ email }).select("+password");
      if (!seller) {
        return res.status(404).json({ message: "No seller found with this email" });
      }

      const isMatch = await bcrypt.compare(password, seller.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      if (seller.accountStatus === AccountStatus.BANNED) {
        return res.status(403).json({ message: "Your account is banned." });
      }
      if (seller.accountStatus === AccountStatus.CLOSED) {
        return res.status(403).json({ message: "Your account is closed." });
      }

      const token = jwtProvider.createJwt({ email });

      return res.status(200).json({
        message:       "Login Success",
        jwt:           token,
        role:          UserRoles.SELLER,
        accountStatus: seller.accountStatus,
        sellerName:    seller.sellerName,
      });

    } catch (err) {
      console.error("Password login error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Get seller dashboard stats ──
  async getSellerStats(req, res) {
    try {
      const seller         = req.seller;
      const Order          = require("../models/Order");
      const ProductListing = require("../models/ProductListing");
      const Review         = require("../models/Review");

      const totalListings  = await ProductListing.countDocuments({ seller: seller._id });
      const activeListings = await ProductListing.countDocuments({ seller: seller._id, isActive: true });
      const outOfStock     = await ProductListing.countDocuments({ seller: seller._id, quantity: 0 });

      const orders          = await Order.find({ "orderItems.seller": seller._id });
      const totalOrders     = orders.length;
      const pendingOrders   = orders.filter(o => o.orderStatus === "PLACED").length;
      const deliveredOrders = orders.filter(o => o.orderStatus === "DELIVERED").length;
      const cancelledOrders = orders.filter(o => o.orderStatus === "CANCELLED").length;

      let totalRevenue = 0;
      orders.forEach(order => {
        order.orderItems.forEach(item => {
          if (item.seller && item.seller.toString() === seller._id.toString()) {
            totalRevenue += (item.sellingPrice || 0) * (item.quantity || 1);
          }
        });
      });

      const sellerProductIds = await ProductListing.find({ seller: seller._id }).distinct("product");
      const reviews          = await Review.find({ product: { $in: sellerProductIds } });
      const totalReviews     = reviews.length;
      const avgRating        = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0;

      res.status(200).json({
        totalListings,
        activeListings,
        outOfStock,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
      });

    } catch (err) {
      console.error("Get seller stats error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Get all seller's listings ──
  async getSellerProductsWithListings(req, res) {
    try {
      const seller         = req.seller;
      const ProductListing = require("../models/ProductListing");

      const listings = await ProductListing.find({ seller: seller._id })
        .populate({
          path: "product",
          populate: { path: "category" },
        })
        .sort({ createdAt: -1 });

      res.status(200).json(listings);
    } catch (err) {
      console.error("Get seller products error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Update listing ── ✅ Notifies seller about low stock
  async updateListing(req, res) {
    try {
      const seller        = req.seller;
      const { listingId } = req.params;
      const { isActive, quantity, sellingPrice, mrpPrice, images } = req.body;

      const ProductListing = require("../models/ProductListing");
      const Product        = require("../models/Product");

      const listing = await ProductListing.findOne({
        _id:    listingId,
        seller: seller._id,
      });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (typeof isActive === "boolean") listing.isActive = isActive;
      if (quantity     !== undefined)    listing.quantity     = quantity;
      if (sellingPrice !== undefined)    listing.sellingPrice = sellingPrice;
      if (mrpPrice     !== undefined)    listing.mrpPrice     = mrpPrice;

      if (listing.mrpPrice > 0) {
        listing.discountPercent = Math.round(
          ((listing.mrpPrice - listing.sellingPrice) / listing.mrpPrice) * 100
        );
      }

      await listing.save();

      // ✅ Notify if stock got low after update
      if (listing.quantity > 0 && listing.quantity <= 5) {
        await notificationQueue.add("low-stock-warning", {
          type:     "low-stock",
          sellerId: seller._id,
          data: {
            productId:   listing.product,
            quantity:    listing.quantity,
            productName: "Product",
          },
        });
      }

      if (Array.isArray(images) && images.length > 0) {
        await Product.findByIdAndUpdate(listing.product, { images });
      }

      const populated = await ProductListing.findById(listing._id)
        .populate({ path: "product", populate: { path: "category" } });

      res.status(200).json(populated);

    } catch (err) {
      console.error("Update listing error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Get reviews on seller's products ──
  async getSellerReviews(req, res) {
    try {
      const seller         = req.seller;
      const ProductListing = require("../models/ProductListing");
      const Review         = require("../models/Review");

      const productIds = await ProductListing.find({ seller: seller._id }).distinct("product");

      const reviews = await Review.find({ product: { $in: productIds } })
        .populate("user",    "fullName email")
        .populate("product", "title images brand")
        .sort({ createdAt: -1 });

      res.status(200).json(reviews);
    } catch (err) {
      console.error("Get seller reviews error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Get available catalog ──
  async getAvailableCatalog(req, res) {
    try {
      const seller         = req.seller;
      const Product        = require("../models/Product");
      const ProductListing = require("../models/ProductListing");

      const mySoldProductIds = await ProductListing
        .find({ seller: seller._id })
        .distinct("product");

      const availableProducts = await Product.find({
        isActive: true,
        _id: { $nin: mySoldProductIds },
      })
        .populate("category")
        .populate({
          path: "defaultListing",
          populate: { path: "seller", select: "sellerName businessDetails" },
        })
        .sort({ createdAt: -1 })
        .limit(200);

      res.status(200).json(availableProducts);
    } catch (err) {
      console.error("getAvailableCatalog error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Claim product ──
  async claimProduct(req, res) {
    try {
      const seller         = req.seller;
      const { productId }  = req.params;
      const { sellingPrice, mrpPrice, quantity, deliveryDays } = req.body;

      const Product        = require("../models/Product");
      const ProductListing = require("../models/ProductListing");
      const ProductService = require("../services/ProductService");

      if (!sellingPrice || !mrpPrice) {
        return res.status(400).json({ message: "sellingPrice and mrpPrice are required" });
      }

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const existing = await ProductListing.findOne({
        product: productId,
        seller:  seller._id,
      });
      if (existing) {
        return res.status(400).json({ message: "You already sell this product" });
      }

      const discountPercent = mrpPrice > 0
        ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
        : 0;

      const listing = await ProductListing.create({
        product:            productId,
        seller:             seller._id,
        mrpPrice,
        sellingPrice,
        discountPercent,
        quantity:           quantity     || 50,
        deliveryDays:       deliveryDays || 5,
        sellerRating:       4.5,
        sellerTotalReviews: 0,
        isActive:           true,
      });

      await ProductService.recalculateProductAggregates(productId);

      const populated = await ProductListing.findById(listing._id)
        .populate({ path: "product", populate: { path: "category" } });

      res.status(201).json(populated);
    } catch (err) {
      console.error("claimProduct error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Delete listing ──
  async deleteListing(req, res) {
    try {
      const seller         = req.seller;
      const { listingId }  = req.params;
      const ProductListing = require("../models/ProductListing");
      const ProductService = require("../services/ProductService");

      const listing = await ProductListing.findOne({
        _id:    listingId,
        seller: seller._id,
      });
      if (!listing) return res.status(404).json({ message: "Listing not found" });

      const productId = listing.product;
      await ProductListing.deleteOne({ _id: listingId });
      await ProductService.recalculateProductAggregates(productId);

      res.status(200).json({ message: "Listing removed" });
    } catch (err) {
      console.error("deleteListing error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ── Update COD settings ──
  async updateCodSettings(req, res) {
    try {
      const seller = req.seller;
      const { codEnabled, codMaxAmount } = req.body;

      if (typeof codEnabled === "boolean") seller.codEnabled = codEnabled;
      if (codMaxAmount !== undefined)      seller.codMaxAmount = Number(codMaxAmount);

      await seller.save();
      res.status(200).json({
        codEnabled:   seller.codEnabled,
        codMaxAmount: seller.codMaxAmount,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new SellerController();