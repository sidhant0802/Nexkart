const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    // ✅ Multiple categories per brand (e.g., Nike → men, women, shoes)
    categories: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    tagline: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    productCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

brandSchema.index({ featured: 1 });
brandSchema.index({ categories: 1 });

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;