const CartItem = require("../models/CartItem");
const Cart = require("../models/Cart");
const ProductListing = require("../models/ProductListing");

class CartService {
  async findUserCart(user) {
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await new Cart({ user: user._id, cartItems: [] }).save();
    }

    const cartItems = await CartItem.find({ cart: cart._id })
      .populate({
        path: "product",
        populate: [{ path: "category" }]
      })
      .populate({
        path: "productListing",
        populate: { path: "seller", select: "sellerName businessDetails" }
      })
      .populate("seller", "sellerName businessDetails");

    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    cartItems.forEach((cartItem) => {
      totalPrice += cartItem.mrpPrice || 0;
      totalDiscountedPrice += cartItem.sellingPrice || 0;
      totalItem += cartItem.quantity || 0;
    });

    cart.totalMrpPrice = totalPrice;
    cart.totalSellingPrice = totalDiscountedPrice;
    cart.discount = this.calculateDiscountPercentage(totalPrice, totalDiscountedPrice);
    cart.totalItem = totalItem;

    await cart.save();

    const cartObject = cart.toObject();
    cartObject.cartItems = cartItems;

    return cartObject;
  }

  calculateDiscountPercentage(mrpPrice, sellingPrice) {
    if (mrpPrice <= 0) return 0;
    const discount = mrpPrice - sellingPrice;
    return Math.round((discount / mrpPrice) * 100);
  }

  // ✅ NEW: Now accepts productListingId (multi-seller support)
  async addCartItem(user, productListing, size, quantity) {
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = await new Cart({ user: user._id, cartItems: [] }).save();
    }

    // Check if same listing already in cart with same size
    let isPresent = await CartItem.findOne({
      cart: cart._id,
      productListing: productListing._id,
      size,
    });

    if (!isPresent) {
      const cartItem = new CartItem({
        product: productListing.product,
        productListing: productListing._id,
        seller: productListing.seller,
        quantity,
        userId: user._id,
        sellingPrice: quantity * productListing.sellingPrice,
        mrpPrice: quantity * productListing.mrpPrice,
        size,
        cart: cart._id,
      });

      await cartItem.save();

      await Cart.findOneAndUpdate(
        { _id: cart._id },
        { $push: { cartItems: cartItem._id } },
        { new: true }
      );

      return cartItem;
    }

    return isPresent;
  }
}

module.exports = new CartService();