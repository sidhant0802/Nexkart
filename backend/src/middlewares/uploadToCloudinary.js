// backend/src/middlewares/uploadToCloudinary.js
// Drop this between your route and controller
// Example: router.post("/", uploadToCloudinary(["images"]), controller.create)

const CloudinaryService = require("../services/CloudinaryService");

const FOLDER_MAP = {
  images:  "nexkart/products",
  logo:    "nexkart/brands",
  image:   "nexkart/banners",
  avatar:  "nexkart/users",
  banner:  "nexkart/banners",
};

const isBase64   = (s) => typeof s === "string" && s.startsWith("data:image");
const isExternal = (s) => typeof s === "string" && s.startsWith("http") && !s.includes("cloudinary.com");
const needsUpload = (s) => isBase64(s) || isExternal(s);

/**
 * @param {string[]} fields - body fields that contain images
 *
 * Usage:
 *   uploadToCloudinary(["images"])          // array field
 *   uploadToCloudinary(["logo"])            // single field
 *   uploadToCloudinary(["logo", "images"])  // multiple fields
 */
const uploadToCloudinary = (fields = []) => {
  return async (req, res, next) => {
    try {
      for (const field of fields) {
        const value = req.body[field];
        if (!value) continue;

        const folder = FOLDER_MAP[field] || "nexkart/misc";

        // ── Single image string ──
        if (typeof value === "string" && needsUpload(value)) {
          console.log(`📤 Uploading ${field} to Cloudinary...`);
          const url = await CloudinaryService.upload(value, { folder });
          req.body[field] = url || value; // fallback to original if upload fails
          console.log(`✅ ${field} uploaded`);
          continue;
        }

        // ── Array of images ──
        if (Array.isArray(value)) {
          const toUpload = value.filter(needsUpload);
          if (toUpload.length === 0) continue;

          console.log(`📤 Uploading ${toUpload.length} ${field} images to Cloudinary...`);

          const uploaded = await Promise.all(
            value.map(async (img) => {
              if (needsUpload(img)) {
                const url = await CloudinaryService.upload(img, { folder });
                return url || img; // fallback to original
              }
              return img; // already Cloudinary URL — keep it
            })
          );

          req.body[field] = uploaded.filter(Boolean);
          console.log(`✅ ${field}: ${toUpload.length} images uploaded`);
        }
      }

      next();
    } catch (err) {
      console.error("❌ Upload middleware error:", err.message);
      // Don't block the request — just log and continue
      // Images will save as base64 (safe fallback)
      next();
    }
  };
};

module.exports = { uploadToCloudinary };