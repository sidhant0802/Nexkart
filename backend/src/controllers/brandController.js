const Brand = require("../models/Brand");
const { deleteCachePattern } = require("../config/redis");

// Helper to generate slug from name
const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ✅ Cache invalidation helper
const invalidateBrandCache = async () => {
  try {
    await deleteCachePattern("cache:/api/brands*");
    await deleteCachePattern("cache:/home-page*");
  } catch (err) {
    // Don't break on cache errors
  }
};

class BrandController {

  // ── Get all brands ── ⚡ OPTIMIZED
  async getAllBrands(req, res) {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: { $ne: false } };  // ✅ Only active

    if (category) filter.category = category;
    if (featured) filter.featured = featured === "true";

    // ✅ Stripped down — only what UI actually needs
    const brands = await Brand
      .find(filter)
      .select("name slug logo featured")  // ✅ Removed description, category, createdAt
      .sort({ featured: -1, name: 1 })    // ✅ Featured first, then alphabetical
      .limit(100)                          // ✅ Cap at 100 (UI can't show more anyway)
      .lean();

    // ✅ Set aggressive caching headers (browsers cache for 1 hour)
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.set("Vary", "Accept-Encoding");
    
    return res.status(200).json(brands);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

  // ── Get single brand ── ⚡ OPTIMIZED
  async getBrandById(req, res) {
    try {
      const brand = await Brand
        .findById(req.params.id)
        .lean();   // ✅ 3x faster

      if (!brand) return res.status(404).json({ error: "Brand not found" });
      return res.status(200).json(brand);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Create brand ──
  async createBrand(req, res) {
    try {
      const { name, logo, description, category, featured } = req.body;

      if (!name) return res.status(400).json({ error: "Brand name is required" });

      const slug = slugify(name);

      const existing = await Brand.findOne({ $or: [{ name }, { slug }] }).lean();
      if (existing) {
        return res.status(400).json({ error: "Brand with this name already exists" });
      }

      const brand = new Brand({
        name,
        slug,
        logo:        logo        || "",
        description: description || "",
        category:    category    || "",
        featured:    featured    || false,
      });

      await brand.save();

      // ✅ Invalidate cache
      await invalidateBrandCache();

      console.log(`✅ Brand created: ${brand.name}`);
      return res.status(201).json(brand);

    } catch (error) {
      console.log("Create brand error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Update brand ──
  async updateBrand(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (data.name) {
        data.slug = slugify(data.name);
      }

      const brand = await Brand
        .findByIdAndUpdate(id, { $set: data }, { new: true })
        .lean();

      if (!brand) return res.status(404).json({ error: "Brand not found" });

      await invalidateBrandCache();
      return res.status(200).json(brand);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Delete brand ──
  async deleteBrand(req, res) {
    try {
      const { id } = req.params;
      const brand = await Brand.findByIdAndDelete(id);
      if (!brand) return res.status(404).json({ error: "Brand not found" });

      await invalidateBrandCache();
      return res.status(200).json({ message: "Brand deleted", id });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ── Toggle featured status ──
  async toggleFeatured(req, res) {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ error: "Brand not found" });

      brand.featured = !brand.featured;
      await brand.save();

      await invalidateBrandCache();
      return res.status(200).json(brand);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new BrandController();