const mongoose = require("mongoose");

const statSchema = new mongoose.Schema({
  val:   { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false });

const bannerSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  highlight:  { type: String, required: true },
  subtitle:   { type: String, required: true },
  badge:      { type: String, default: "" },
  
  cta:        { type: String, default: "Shop Now" },
  ctaLink:    { type: String, default: "/" },
  secondCta:  { type: String, default: "View All" },
  secondLink: { type: String, default: "/" },
  
  image:      { type: String, required: true },
  overlay:    { type: String, default: "from-black/80 via-black/40 to-transparent" },
  accent:     { type: String, default: "#6366f1" },
  
  stats:      { type: [statSchema], default: [] },
  
  isActive:   { type: Boolean, default: true },
  order:      { type: Number,  default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);