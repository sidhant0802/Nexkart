// backend/src/config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,   // always use HTTPS
});

// Test connection
cloudinary.api.ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch((err) => console.error("❌ Cloudinary error:", err.message));

module.exports = cloudinary;