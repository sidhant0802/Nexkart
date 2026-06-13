const Product       = require("../models/Product");
const mongoose      = require("mongoose");
const { getCache, setCache } = require("../config/redis");

class SearchService {

  async initIndex() {
    console.log("✅ Search Service ready (text index + Redis cache)");
  }

  // ══════════════════════════════════════════════════════
  // 🔍 MAIN SEARCH — Cached + Text Index
  // ══════════════════════════════════════════════════════
  async search(query, options = {}) {
    const startTime = Date.now();
    const { page = 1, limit = 20, brand, category, minPrice, maxPrice, sortBy } = options;

    // ✅ Cache key (includes all filters)
    const cacheKey = `search:${query}:${page}:${limit}:${brand || ""}:${category || ""}:${minPrice || ""}:${maxPrice || ""}:${sortBy || ""}`;

    // ✅ Try cache first (5 min TTL)
    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log(`🎯 Search cache HIT: "${query}"`);
        return { ...cached, processingTimeMs: Date.now() - startTime, cached: true };
      }
    } catch (e) {}

    try {
      const filter = {};

      // ✅ Use MongoDB text index (10× faster than regex)
      if (query && query.trim()) {
        filter.$text = { $search: query };
      }

      if (brand)    filter.brand    = brand; // exact match faster than regex
      if (category) filter.category = new mongoose.Types.ObjectId(category);
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.minPrice = {};
        if (minPrice !== undefined) filter.minPrice.$gte = Number(minPrice);
        if (maxPrice !== undefined) filter.minPrice.$lte = Number(maxPrice);
      }

      // ✅ Sort
      let sort;
      if (query && query.trim()) {
        sort = { score: { $meta: "textScore" } }; // text relevance
      } else if (sortBy === "price-asc")  sort = { minPrice: 1 };
      else if (sortBy === "price-desc")  sort = { minPrice: -1 };
      else if (sortBy === "rating")      sort = { averageRating: -1 };
      else                                sort = { createdAt: -1 };

      // ✅ ONE query with all needed fields (no populate!)
      const projection = query && query.trim()
        ? { score: { $meta: "textScore" }, title: 1, brand: 1, images: 1, minPrice: 1, minMrpPrice: 1, averageRating: 1, numRatings: 1, category: 1, totalSellers: 1 }
        : { title: 1, brand: 1, images: 1, minPrice: 1, minMrpPrice: 1, averageRating: 1, numRatings: 1, category: 1, totalSellers: 1 };

      const hits = await Product
        .find(filter, projection)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

      // ✅ Skip countDocuments for performance (use estimatedDocumentCount or skip total)
      // For most UI, "showing 20 of many" is fine
      const total = hits.length === Number(limit) ? `${limit}+` : hits.length;

      const result = {
        hits,
        total,
        page,
        limit,
        processingTimeMs: Date.now() - startTime,
        cached: false,
      };

      // ✅ Cache for 5 minutes
      try {
        await setCache(cacheKey, result, 300);
      } catch (e) {}

      console.log(`🔍 Search "${query}" → ${hits.length} results in ${result.processingTimeMs}ms`);
      return result;

    } catch (err) {
      console.error("Search error:", err.message);
      return { hits: [], total: 0, processingTimeMs: Date.now() - startTime };
    }
  }

  // ══════════════════════════════════════════════════════
  // 🔎 AUTOCOMPLETE — Cached aggressively
  // ══════════════════════════════════════════════════════
  async suggest(query, limit = 5) {
    if (!query || !query.trim()) return [];

    const cacheKey = `suggest:${query.toLowerCase()}:${limit}`;

    // ✅ Try cache (10 min TTL — suggestions don't change often)
    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {}

    try {
      // ✅ Use text search (much faster than regex)
      const results = await Product
        .find(
          { $text: { $search: query } },
          { 
            score: { $meta: "textScore" },
            title: 1, brand: 1, images: { $slice: 1 }, minPrice: 1, category: 1 
          }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(Number(limit))
        .populate("category", "categoryId name")
        .lean();

      // ✅ Cache for 10 minutes
      try {
        await setCache(cacheKey, results, 600);
      } catch (e) {}

      return results;

    } catch (err) {
      console.error("Suggest error:", err.message);
      return [];
    }
  }

  async indexProduct() { return true; }
  async deleteProduct() { return true; }
  async indexAllProducts() { return { indexed: "auto" }; }
}

module.exports = new SearchService();