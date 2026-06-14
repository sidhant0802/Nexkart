const express = require('express');
const router  = express.Router();
const returnController     = require('../controllers/returnController');
const userAuthMiddleware   = require('../middlewares/userAuthMiddleware');
const sellerAuthMiddleware = require('../middlewares/sellerAuthMiddleware');

// Customer routes
router.post(
  '/order/:orderId/item/:orderItemId',
  userAuthMiddleware,
  returnController.requestReturn
);

router.get(
  '/item/:orderItemId',
  userAuthMiddleware,
  returnController.getReturnStatus
);

router.get(
  '/eligibility/:orderId',
  userAuthMiddleware,
  returnController.checkReturnEligibility
);

// Seller routes
router.get(
  '/seller',
  sellerAuthMiddleware,
  returnController.getSellerReturns
);

router.put(
  '/seller/:returnId',
  sellerAuthMiddleware,
  returnController.updateReturnStatus
);

module.exports = router;