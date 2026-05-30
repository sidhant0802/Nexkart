const CartService = require("../services/CartService");
const CartItemService = require("../services/CartItemService");
const ProductListing = require("../models/ProductListing");

class CartController {
  // Get user's cart
  async findUserCartHandler(req, res) {
    try {
      const user = await req.user;
      const cart = await CartService.findUserCart(user);
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Add to cart now uses productListingId (multi-seller support)
  // ⚠️ Method renamed from addItemToCartHandler → addItemToCart to match cartRoutes.js
  async addItemToCart(req, res) {
    try {
      const user = await req.user;
      const { productListingId, size, quantity = 1 } = req.body;

      if (!productListingId) {
        return res.status(400).json({ error: "productListingId is required" });
      }

      const listing = await ProductListing.findById(productListingId);
      if (!listing || !listing.isActive) {
        return res.status(404).json({ error: "Listing not found or inactive" });
      }

      if (listing.quantity < quantity) {
        return res.status(400).json({ error: "Not enough stock available" });
      }

      const cartItem = await CartService.addCartItem(user, listing, size, quantity);
      res.status(200).json(cartItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteCartItemHandler(req, res) {
    try {
      const user = await req.user;
      await CartItemService.removeCartItem(user._id, req.params.cartItemId);
      res.status(202).json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCartItemHandler(req, res) {
    try {
      const cartItemId = req.params.cartItemId;
      const { quantity } = req.body;

      const user = await req.user;
      let updatedCartItem;
      if (quantity > 0) {
        updatedCartItem = await CartItemService.updateCartItem(
          user._id,
          cartItemId,
          { quantity }
        );
      }

      res.status(202).json(updatedCartItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CartController();