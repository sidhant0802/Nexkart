const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// ── OTP ──
router.post("/sent/login-signup-otp", authController.sentLoginOtp);

// ── Signup ──
router.post("/signup", authController.createUserHandler);

// ── Signin ──
router.post("/signin",          authController.signinOtp);       // OTP login
router.post("/signin/password", authController.signinPassword);  // Password login

// ── Forgot Password ──
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password",  authController.resetPassword);

// ── Location ──
router.post("/update-location", authController.updateLocation);

module.exports = router;