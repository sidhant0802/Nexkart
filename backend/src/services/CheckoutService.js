// backend/src/services/CheckoutService.js
const mongoose         = require("mongoose");
const Order            = require("../models/Order");
const OrderItem        = require("../models/OrderItem");
const ProductListing   = require("../models/ProductListing");
const Address          = require("../models/Address");
const User             = require("../models/User");
const Cart             = require("../models/Cart");
const Seller           = require("../models/Seller");
const StockLockService = require("./StockLockService");
const OrderStatus      = require("../domain/OrderStatus");
const PaymentStatus    = require("../domain/PaymentStatus");
const PaymentMethod    = require("../domain/PaymentMethod");
const TrackingService = require("./TrackingService");

class CheckoutService {

  // ═══════════════════════════════════════════════════
  // BUY NOW — Single product instant checkout
  // ═══════════════════════════════════════════════════
  async buyNow({ user, listingId, quantity, shippingAddress, paymentMethod }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Load listing with seller populated
      const listing = await ProductListing
        .findById(listingId)
        .populate("product")
        .populate("seller")           // ✅ must populate seller
        .session(session);

      if (!listing)          throw new Error("Product listing not found");
      if (!listing.isActive) throw new Error("This product is no longer available");
      if (!listing.seller)   throw new Error("Seller not found for this listing");

      const sellerId   = listing.seller._id || listing.seller;
      const orderTotal = listing.sellingPrice * quantity;

      // 2. Validate COD
      if (paymentMethod === PaymentMethod.COD) {
        const seller = await Seller.findById(sellerId).session(session);
        if (!seller)              throw new Error("Seller not found");
        if (!seller.codEnabled)   throw new Error("This seller does not accept Cash on Delivery");
        if (orderTotal > seller.codMaxAmount) {
          throw new Error(`COD not available for orders above ₹${seller.codMaxAmount}`);
        }
      }

      // 3. Resolve address
      const address = await this._resolveAddress(user, shippingAddress, session);

      // 4. Lock stock
      await StockLockService.lockStock(listingId, quantity, session);

      // 5. Create OrderItem ✅ NOW WITH seller field
      const orderItem = await OrderItem.create([{
        product:        listing.product._id,
        productListing: listing._id,
        seller:         sellerId,          // ✅ FIXED
        mrpPrice:       listing.mrpPrice,
        sellingPrice:   listing.sellingPrice,
        quantity:       quantity,
        size:           "FREE",
      }], { session });

      // 6. Create Order
      const initialStatus = paymentMethod === PaymentMethod.COD
        ? OrderStatus.CONFIRMED
        : OrderStatus.PAYMENT_PENDING;

      const newOrder = await Order.create([{
        user:              user._id,
        seller:            sellerId,
        orderItems:        [orderItem[0]._id],
        shippingAddress:   address._id,
        totalMrpPrice:     listing.mrpPrice * quantity,
        totalSellingPrice: orderTotal,
        discount:          (listing.mrpPrice - listing.sellingPrice) * quantity,
        totalItem:         quantity,
        orderStatus:       initialStatus,
        paymentStatus:     PaymentStatus.PENDING,
        paymentMethod:     paymentMethod,
      }], { session });

      // 7. Sync stock
      await StockLockService.syncProductStock(listing.product._id, session);

      await session.commitTransaction();
      session.endSession();

      // ✅ Create tracking (outside transaction)
      try {
        await TrackingService.createTracking(newOrder[0]._id);
      } catch (e) {
        console.error("Tracking creation failed:", e.message);
      }

      console.log("✅ buyNow order created:", newOrder[0]._id);
      return newOrder[0];

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("buyNow error:", err.message);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════
  // CART CHECKOUT — Multi-item, multi-seller
  // ═══════════════════════════════════════════════════
  async checkoutCart({ user, shippingAddress, paymentMethod }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Load cart
      const cart = await Cart.findOne({ user: user._id })
        .populate({
          path: "cartItems",
          populate: [
            { path: "product" },
            { path: "listing", populate: { path: "seller" } },
          ],
        })
        .session(session);

      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // 2. Resolve address
      const address = await this._resolveAddress(user, shippingAddress, session);

      // 3. Group items by seller
      const itemsBySeller = {};

      for (const item of cart.cartItems) {
        let listing = item.listing;

        if (!listing && item.product) {
          listing = await ProductListing
            .findOne({ product: item.product._id, isActive: true })
            .populate("seller")
            .sort({ sellingPrice: 1 })
            .session(session);
        }

        if (!listing) {
          throw new Error(`No active seller for "${item.product?.title}"`);
        }

        // ✅ Ensure seller is populated
        if (!listing.seller || typeof listing.seller === "string") {
          listing = await ProductListing
            .findById(listing._id)
            .populate("seller")
            .session(session);
        }

        const sellerId = (listing.seller?._id || listing.seller).toString();
        if (!itemsBySeller[sellerId]) {
          itemsBySeller[sellerId] = { items: [], seller: listing.seller };
        }
        itemsBySeller[sellerId].items.push({ cartItem: item, listing });
      }

      // 4. Validate COD per seller
      if (paymentMethod === PaymentMethod.COD) {
        for (const [sellerId, { items, seller }] of Object.entries(itemsBySeller)) {
          const dbSeller = await Seller.findById(sellerId).session(session);
          const sellerTotal = items.reduce(
            (sum, x) => sum + (x.listing.sellingPrice * x.cartItem.quantity), 0
          );

          if (!dbSeller?.codEnabled) {
            throw new Error(`Seller "${dbSeller?.sellerName || sellerId}" doesn't accept COD`);
          }
          if (sellerTotal > dbSeller.codMaxAmount) {
            throw new Error(
              `COD limit (₹${dbSeller.codMaxAmount}) exceeded for ${dbSeller.sellerName}`
            );
          }
        }
      }

      // 5. Lock all stocks
      const stockItems = [];
      for (const { items } of Object.values(itemsBySeller)) {
        for (const { cartItem, listing } of items) {
          stockItems.push({ listingId: listing._id, quantity: cartItem.quantity });
        }
      }
      await StockLockService.lockMultipleStocks(stockItems, session);

      // 6. Create one order per seller
      const orders = [];
      const initialStatus = paymentMethod === PaymentMethod.COD
        ? OrderStatus.CONFIRMED
        : OrderStatus.PAYMENT_PENDING;

      for (const [sellerId, { items }] of Object.entries(itemsBySeller)) {
        const orderItemIds = [];
        let totalMrp     = 0;
        let totalSelling = 0;
        let totalItems   = 0;

        for (const { cartItem, listing } of items) {
          // ✅ OrderItem now includes seller
          const orderItem = await OrderItem.create([{
            product:        cartItem.product._id,
            productListing: listing._id,
            seller:         sellerId,       // ✅ FIXED
            mrpPrice:       listing.mrpPrice,
            sellingPrice:   listing.sellingPrice,
            quantity:       cartItem.quantity,
            size:           cartItem.size || "FREE",
          }], { session });

          orderItemIds.push(orderItem[0]._id);
          totalMrp     += listing.mrpPrice     * cartItem.quantity;
          totalSelling += listing.sellingPrice * cartItem.quantity;
          totalItems   += cartItem.quantity;
        }

        const order = await Order.create([{
          user:              user._id,
          seller:            sellerId,
          orderItems:        orderItemIds,
          shippingAddress:   address._id,
          totalMrpPrice:     totalMrp,
          totalSellingPrice: totalSelling,
          discount:          totalMrp - totalSelling,
          totalItem:         totalItems,
          orderStatus:       initialStatus,
          paymentStatus:     PaymentStatus.PENDING,
          paymentMethod:     paymentMethod,
        }], { session });

        orders.push(order[0]);
      }

      // 7. Clear cart
        // 7. Clear cart
      cart.cartItems = [];
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();

      // ✅ Create tracking for each order
      for (const order of orders) {
        try {
          await TrackingService.createTracking(order._id);
        } catch (e) {
          console.error("Tracking creation failed:", e.message);
        }
      }

      console.log("✅ checkoutCart orders created:", orders.map(o => o._id));
      return orders;

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("checkoutCart error:", err.message);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════
  // Release stock for failed/cancelled orders
  // ═══════════════════════════════════════════════════
  async releaseOrderStock(orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId)
        .populate({ path: "orderItems", populate: { path: "product" } })
        .session(session);

      if (!order) throw new Error("Order not found");

      for (const item of order.orderItems) {
        const listing = await ProductListing.findOne({
          product: item.product._id,
          seller:  order.seller,
        }).session(session);

        if (listing) {
          await StockLockService.releaseStock(listing._id, item.quantity, session);
          await StockLockService.syncProductStock(item.product._id, session);
        }
      }

      order.orderStatus   = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.FAILED;
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();
      return order;

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════
  // Helper — Resolve shipping address
  // ═══════════════════════════════════════════════════
  async _resolveAddress(user, addressInput, session) {
    // ✅ Use existing saved address
    if (addressInput._id) {
      const existing = await Address.findById(addressInput._id).session(session);
      if (!existing) throw new Error("Address not found");

      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { addresses: addressInput._id } },
        { session }
      );
      return existing;
    }

    // ✅ Create new address and save to user
    const created = await Address.create([{
      name:     addressInput.name,
      mobile:   addressInput.mobile,
      address:  addressInput.address,
      locality: addressInput.locality || addressInput.city,
      city:     addressInput.city,
      state:    addressInput.state,
      pinCode:  addressInput.pinCode,
    }], { session });

    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { addresses: created[0]._id } },
      { session }
    );

    return created[0];
  }
}

module.exports = new CheckoutService();