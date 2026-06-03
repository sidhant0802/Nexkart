const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const User = require('../models/User');
const CartService = require('./CartService');
const CouponNotValidException = require('../exceptions/CouponNotValidException');

const couponService = {
  async applyCoupon(code, orderValue, user) {
    try {
      const coupon = await Coupon.findOne({ code });
      const cart = await Cart.findOne({ user: user._id });

      if (!coupon) throw new CouponNotValidException('Coupon not found');
      if (!cart) throw new CouponNotValidException('Cart not found');

      if (!user.usedCoupons) user.usedCoupons = [];

      const alreadyUsed = user.usedCoupons.some(
        (id) => id.toString() === coupon._id.toString()
      );

      if (alreadyUsed) {
        throw new CouponNotValidException('Coupon already used');
      }

      if (orderValue <= coupon.minimumOrderValue) {
        throw new CouponNotValidException(
          `Valid for minimum order value ${coupon.minimumOrderValue}`
        );
      }

      const currentDate = new Date();

      if (
        coupon.isActive &&
        currentDate >= coupon.validityStartDate &&
        currentDate <= coupon.validityEndDate
      ) {
        user.usedCoupons.push(coupon._id);
        await user.save();

        const discount = Math.round(
          (cart.totalSellingPrice * coupon.discountPercentage) / 100
        );
        
        cart.couponCode = code;
        cart.couponPrice = discount;
        await cart.save();

        return await CartService.findUserCart(user);
      }

      throw new CouponNotValidException('Coupon not valid or expired');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // ✅ FIXED - Won't fail if coupon was deleted
  async removeCoupon(code, user) {
    try {
      const cart = await Cart.findOne({ user: user._id });
      if (!cart) throw new Error('Cart not found');

      // Try to find - but don't fail
      const coupon = await Coupon.findOne({ code });
      
      if (coupon) {
        user.usedCoupons = user.usedCoupons.filter(
          (id) => id.toString() !== coupon._id.toString()
        );
        await user.save();
      }

      // Always clear coupon from cart
      cart.couponCode = null;
      cart.couponPrice = 0;
      await cart.save();

      return await CartService.findUserCart(user);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async createCoupon(couponData) {
    try {
      const newCoupon = new Coupon(couponData);
      return await newCoupon.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // ✅ FIXED - Cleans up carts when admin deletes coupon
  async deleteCoupon(couponId) {
    try {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) throw new Error('Coupon not found');

      // Clear coupon from all carts using it
      await Cart.updateMany(
        { couponCode: coupon.code },
        { 
          $set: { 
            couponCode: null, 
            couponPrice: 0 
          } 
        }
      );

      // Remove from users' usedCoupons
      await User.updateMany(
        { usedCoupons: coupon._id },
        { $pull: { usedCoupons: coupon._id } }
      );

      // Delete the coupon
      await Coupon.findByIdAndDelete(couponId);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getAllCoupons() {
    try {
      return await Coupon.find();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getCouponById(couponId) {
    try {
      return await Coupon.findById(couponId);
    } catch (error) {
      throw new Error('Coupon not found');
    }
  }
};

module.exports = couponService;