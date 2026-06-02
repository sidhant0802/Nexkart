const CartItem = require("../models/CartItem");
const ProductListing = require("../models/ProductListing");
const CartItemError = require("../exceptions/CartItemErrror");
const UserError = require("../exceptions/UserError");

class CartItemService {
  async updateCartItem(userId, id, cartItemData) {
    const cartItem = await this.findCartItemById(id);

    if (cartItem.userId.toString() === userId.toString()) {
      // Get listing to recalculate prices
      const listing = await ProductListing.findById(cartItem.productListing);
      if (!listing) throw new CartItemError("Listing not found");

      const updatedFields = {
        quantity: cartItemData.quantity,
        mrpPrice: cartItemData.quantity * listing.mrpPrice,
        sellingPrice: cartItemData.quantity * listing.sellingPrice,
      };

      return await CartItem.findByIdAndUpdate(id, updatedFields, { new: true })
        .populate("product")
        .populate({ path: "productListing", populate: { path: "seller" } });
    } else {
      throw new CartItemError("You can't update another user's cart item");
    }
  }

  async removeCartItem(userId, cartItemId) {
    const cartItem = await this.findCartItemById(cartItemId);

    if (cartItem.userId.toString() === userId.toString()) {
      await CartItem.deleteOne({ _id: cartItem._id });
    } else {
      throw new UserError("You can't remove another user's item");
    }
  }

  async findCartItemById(cartItemId) {
    const cartItem = await CartItem.findById(cartItemId)
      .populate("product")
      .populate({ path: "productListing", populate: { path: "seller" } });

    if (!cartItem) {
      throw new CartItemError(`Cart item not found with id: ${cartItemId}`);
    }

    return cartItem;
  }
}

module.exports = new CartItemService();