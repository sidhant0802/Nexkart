const mongoose = require("mongoose");

const featuredTabSchema = new mongoose.Schema({
  label:    { type: String, required: true },
  category: { type: String, default: ""   },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0     },
}, { _id: false });

const homeSettingsSchema = new mongoose.Schema({
  // ── Featured Products ──
  featuredProductCount: { type: Number, default: 20, min: 5, max: 100 },
  featuredSortMode: {
    type:    String,
    enum:    ["random", "latest", "price_low", "price_high", "best_selling"],
    default: "random",
  },
  featuredTabs: {
    type: [featuredTabSchema],
    default: [
      { label: "All",       category: "",                   isActive: true, order: 0 },
      { label: "Mobiles",   category: "mobiles",            isActive: true, order: 1 },
      { label: "Fashion",   category: "women_western_wear", isActive: true, order: 2 },
      { label: "Footwear",  category: "men_footwear",       isActive: true, order: 3 },
      { label: "Ethnic",    category: "women_sarees",       isActive: true, order: 4 },
      { label: "Furniture", category: "home_furniture",     isActive: true, order: 5 },
    ],
  },

  // ── Brands Section ── ✅ NEW
  brandDisplayCount: { type: Number, default: 18, min: 5, max: 100 },
  brandSortMode: {
    type:    String,
    enum:    ["featured_first", "alphabetical", "random", "newest"],
    default: "featured_first",
  },
  showBrandsOnHome: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model("HomeSettings", homeSettingsSchema);