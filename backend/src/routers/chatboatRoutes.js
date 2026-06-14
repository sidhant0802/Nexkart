const express = require('express');
const ChatboatController = require('../controllers/ChatboatController');
const UserService = require('../services/UserService');

const router = express.Router();

// 🔐 Optional auth - safely extracts user without crashing
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token || token === "null" || token === "undefined") return next();

    try {
      const user = await UserService.findUserProfileByJwt(token);
      if (user) {
        req.user = user;
        console.log("✅ Chat user authenticated:", user._id.toString());
      }
    } catch (err) {
      console.log("⚠️ Auth failed (continuing as guest):", err.message);
    }

    next();
  } catch (e) {
    next();
  }
};

router.post('/smart', optionalAuth, ChatboatController.smartChat);
router.post('/', optionalAuth, ChatboatController.simpleChat);
router.post('/product/:productId', ChatboatController.askProductQuestionController);
router.get('/insights/:productId', ChatboatController.getProductInsights);
router.post('/compare', ChatboatController.compareProducts);

module.exports = router;