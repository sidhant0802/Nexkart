const express              = require("express");
const sellerController     = require("../controllers/sellerController");
const sellerAuthMiddleware = require("../middlewares/sellerAuthMiddleware");

const router = express.Router();

// ── Public Auth Routes ──
router.post("/send/login-otp",   sellerController.sendLoginOtp);
router.post("/verify/login-otp", sellerController.verifyLoginOtp);
router.post("/login/password",   sellerController.loginWithPassword);
router.post("/",                 sellerController.createSeller);

// ── Protected: Profile ──
router.get("/profile",           sellerAuthMiddleware, sellerController.getSellerProfile);
router.put("/profile",           sellerAuthMiddleware, sellerController.updateSeller);
router.patch("/profile",         sellerAuthMiddleware, sellerController.updateSeller);

// ── Protected: Dashboard ──
router.get("/stats",             sellerAuthMiddleware, sellerController.getSellerStats);

// ── Protected: Listings ──
router.get("/listings",                      sellerAuthMiddleware, sellerController.getSellerProductsWithListings);
router.put("/listings/:listingId",           sellerAuthMiddleware, sellerController.updateListing);
router.patch("/listings/:listingId",         sellerAuthMiddleware, sellerController.updateListing);
router.delete("/listings/:listingId",        sellerAuthMiddleware, sellerController.deleteListing);

// ── Protected: Catalog ──
router.get("/catalog/available",             sellerAuthMiddleware, sellerController.getAvailableCatalog);
router.post("/catalog/claim/:productId",     sellerAuthMiddleware, sellerController.claimProduct);

// ── Protected: Reviews ──
router.get("/reviews",                       sellerAuthMiddleware, sellerController.getSellerReviews);

// ── Protected: COD ──
router.patch("/cod-settings",                sellerAuthMiddleware, sellerController.updateCodSettings);

// ── Protected: Email verify ──
router.patch("/verify-email",                sellerController.verifyEmail);

// ── Admin Routes (put :id LAST to avoid conflicts) ──
router.get("/",                              sellerController.getAllSellers);
router.get("/:id",                           sellerController.getSellerById);
router.delete("/:id",                        sellerController.deleteSeller);
router.patch("/:id/status/:status",          sellerController.updateSellerAccountStatus);

module.exports = router;
