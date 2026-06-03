// backend/src/services/CloudinaryService.js
const cloudinary = require("../config/cloudinary");

const FOLDER = process.env.CLOUDINARY_FOLDER || "nexkart";

class CloudinaryService {

  // ══════════════════════════════════════════════════════
  // UPLOAD METHODS
  // ══════════════════════════════════════════════════════

  /**
   * Upload base64 or remote URL to Cloudinary
   * @param {string} source - base64 string OR remote URL
   * @param {object} options - { folder, publicId, tags }
   */
  async upload(source, options = {}) {
    if (!source) return null;

    // Skip if already a Cloudinary URL
    if (typeof source === "string" && source.includes("cloudinary.com")) {
      return source;
    }

    try {
      const result = await cloudinary.uploader.upload(source, {
        folder:           options.folder || `${FOLDER}/products`,
        public_id:        options.publicId,
        resource_type:    "image",
        overwrite:        false,
        unique_filename:  true,
        tags:             options.tags || [],
        // Auto optimization
        fetch_format:     "auto",
        quality:          "auto",
        // Eager generate thumbnails (faster first load)
        eager: [
          { width: 150,  height: 150,  crop: "fill", quality: "auto:eco", fetch_format: "auto" },  // thumbnail
          { width: 400,  height: 400,  crop: "fill", quality: "auto:good", fetch_format: "auto" }, // medium
          { width: 800,  crop: "limit", quality: "auto:best", fetch_format: "auto" },              // large
        ],
        eager_async: false,
      });

      console.log(`✅ Uploaded to Cloudinary: ${result.public_id}`);
      return result.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary upload error:", err.message);
      // Return original on failure (don't break the app)
      return source;
    }
  }

  /**
   * Upload multiple images in parallel
   */
  async uploadMany(sources = [], options = {}) {
    if (!Array.isArray(sources) || sources.length === 0) return [];

    const results = await Promise.all(
      sources.map(src => this.upload(src, options))
    );

    return results.filter(Boolean);
  }

  // ══════════════════════════════════════════════════════
  // DELETE METHODS
  // ══════════════════════════════════════════════════════

  /**
   * Delete image from Cloudinary by URL or public ID
   */
  async delete(urlOrPublicId) {
    if (!urlOrPublicId) return false;

    try {
      const publicId = this.extractPublicId(urlOrPublicId);
      if (!publicId) return false;

      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️  Deleted from Cloudinary: ${publicId}`);
      return result.result === "ok";
    } catch (err) {
      console.error("❌ Cloudinary delete error:", err.message);
      return false;
    }
  }

  // ══════════════════════════════════════════════════════
  // URL TRANSFORMATION HELPERS
  // ══════════════════════════════════════════════════════

  /**
   * Extract public_id from a Cloudinary URL
   * Example: https://res.cloudinary.com/xx/image/upload/v123/folder/file.jpg
   *          → folder/file
   */
  extractPublicId(url) {
    if (!url || typeof url !== "string") return null;
    if (!url.includes("cloudinary.com")) return null;

    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|webp|gif|avif)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Build an optimized Cloudinary URL from any URL or public ID
   * Used to transform existing URLs
   */
  buildUrl(urlOrPublicId, transformations = "q_auto,f_auto") {
    if (!urlOrPublicId) return "";

    // Already a Cloudinary URL — inject transformations
    if (typeof urlOrPublicId === "string" && urlOrPublicId.includes("cloudinary.com")) {
      // Insert transformations after /upload/
      return urlOrPublicId.replace(
        /\/upload\/(?:v\d+\/)?/,
        `/upload/${transformations}/`
      );
    }

    // Public ID → build full URL
    return cloudinary.url(urlOrPublicId, {
      secure:        true,
      quality:       "auto",
      fetch_format:  "auto",
      transformation: transformations.split(",").map(t => {
        const [key, value] = t.split("_");
        return { [key]: value };
      }),
    });
  }

  // ══════════════════════════════════════════════════════
  // PRESET SIZE GENERATORS (called from frontend helper)
  // ══════════════════════════════════════════════════════

  thumbnail(url) {
    return this.buildUrl(url, "w_150,h_150,c_fill,q_auto:eco,f_auto");
  }

  medium(url) {
    return this.buildUrl(url, "w_400,h_400,c_fill,q_auto:good,f_auto");
  }

  large(url) {
    return this.buildUrl(url, "w_800,c_limit,q_auto:best,f_auto");
  }

  // For brand logos (transparent background)
  logo(url) {
    return this.buildUrl(url, "w_200,h_100,c_fit,q_auto:good,f_auto");
  }

  // For banners (wide aspect)
  banner(url) {
    return this.buildUrl(url, "w_1600,h_500,c_fill,q_auto:good,f_auto");
  }
}

module.exports = new CloudinaryService();