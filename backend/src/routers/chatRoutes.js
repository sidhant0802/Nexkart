const express = require('express');
const router  = express.Router();
const chatController       = require('../controllers/chatController');
const userAuthMiddleware   = require('../middlewares/userAuthMiddleware');
const sellerAuthMiddleware = require('../middlewares/sellerAuthMiddleware');
const multer               = require('multer');

// Use memory storage for cloudinary upload
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50mb for videos
});

// ── Customer routes ──
router.get(
  '/order/:orderId',
  userAuthMiddleware,
  chatController.getOrCreateChat
);

router.post(
  '/order/:orderId/message',
  userAuthMiddleware,
  upload.single('media'),
  chatController.sendMessage
);

router.get(
  '/user/all',
  userAuthMiddleware,
  chatController.getUserChats
);

// ── Seller routes ──
router.get(
  '/seller/order/:orderId',
  sellerAuthMiddleware,
  chatController.getOrCreateChat
);

router.post(
  '/seller/order/:orderId/message',
  sellerAuthMiddleware,
  upload.single('media'),
  chatController.sendMessage
);

router.get(
  '/seller/all',
  sellerAuthMiddleware,
  chatController.getSellerChats
);

module.exports = router;