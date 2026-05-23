const express = require('express');
const couponController = require('../controllers/couponController');

// ✅ CORRECT - default import (no curly braces)
const authMiddleware = require('../middlewares/userAuthMiddleware');

const router = express.Router();

// ✅ Protected - user must be logged in to apply coupon
router.post('/apply', authMiddleware, couponController.applyCoupon);

// Admin routes
router.post('/admin/create', couponController.createCoupon);
router.delete('/admin/delete/:id', couponController.deleteCoupon);
router.get('/admin/all', couponController.getAllCoupons);

module.exports = router;