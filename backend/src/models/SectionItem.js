const mongoose = require("mongoose");

const SECTIONS = [
  "men",
  "women",
  "electronics",
  "fashion",
  "lightning",
  "furniture",
];

const sectionItemSchema = new mongoose.Schema({
  // ── Item info ──
  name:       { type: String, required: true },
  categoryId: { type: String, required: true },
  image:      { type: String, required: true },

  // ── Section (which home page box) ──
  section: {
    type:     String,
    enum:     SECTIONS,
    required: true,
  },

  // ── Subcategory grouping ──
  // e.g. "Computing", "Mobile & Tablets", "Audio"
  subcategory: {
    type:    String,
    default: "",
  },

  // ── Lightning specific ──
  discount: { type: String, default: "" },

  // ── Visibility & ordering ──
  isActive:      { type: Boolean, default: true  },  // shows on home page
  showInViewAll: { type: Boolean, default: true  },  // shows in "View All" page
  order:         { type: Number,  default: 0     },

}, { timestamps: true });

sectionItemSchema.index({ section: 1, subcategory: 1, order: 1 });

module.exports = mongoose.model("SectionItem", sectionItemSchema);