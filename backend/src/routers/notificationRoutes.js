const express = require('express');
const router  = express.Router();
const notificationController = require('../controllers/notificationController');
const userAuthMiddleware      = require('../middlewares/userAuthMiddleware');
const sellerAuthMiddleware    = require('../middlewares/sellerAuthMiddleware');

// Customer
router.get(  '/user',        userAuthMiddleware,   notificationController.getUserNotifications);
router.put(  '/user/read',   userAuthMiddleware,   notificationController.markUserNotificationsRead);

// Seller
router.get(  '/seller',      sellerAuthMiddleware, notificationController.getSellerNotifications);
router.put(  '/seller/read', sellerAuthMiddleware, notificationController.markSellerNotificationsRead);

// Admin
router.get(  '/admin',       notificationController.getAdminNotifications);

module.exports = router;