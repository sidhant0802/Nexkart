const mongoose = require("mongoose");
const UserRoles = require("../domain/UserRole");

const userSchema = new mongoose.Schema(
  {
    // ── Required Auth ──
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Contact ──
    mobile: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      default: "+91",
    },

    // ── Personal Details ──
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    profileImage: {
      type: String,
    },

    // ── Live Location ──
    location: {
      latitude:  { type: Number },
      longitude: { type: Number },
      city:      { type: String },
      state:     { type: String },
      country:   { type: String, default: "India" },
      pincode:   { type: String },
      formattedAddress: { type: String },
      capturedAt: { type: Date },
    },

    // ── Verification Status ──
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // ── Auth Methods ──
    authMethod: {
      type: String,
      enum: ["password", "otp", "both"],
      default: "both",
    },

    // ── Account Status ──
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },

    // ── Last Login Tracking ──
    lastLogin:    { type: Date },
    lastLoginIP:  { type: String },
    loginCount:   { type: Number, default: 0 },

    // ── Existing ──
    role: {
      type: String,
      enum: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      default: UserRoles.CUSTOMER,
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    usedCoupons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
  },
  { timestamps: true }
);

// ── Indexes for performance ──
// userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;