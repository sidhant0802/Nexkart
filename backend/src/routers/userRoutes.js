const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/userAuthMiddleware");

router.get("/profile",   authMiddleware, userController.getUserProfileByJwt);

// ✅ Profile update
router.put("/profile",   authMiddleware, userController.updateProfile);

// ✅ Password
router.put("/password",  authMiddleware, userController.changePassword);

// ✅ Addresses
router.post("/address",       authMiddleware, userController.addAddress);
router.put("/address/:id",    authMiddleware, userController.updateAddress);
router.delete("/address/:id", authMiddleware, userController.deleteAddress);

module.exports = router;