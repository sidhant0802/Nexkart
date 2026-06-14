const express = require("express");
const router  = express.Router();
const SearchService = require("../services/SearchService");
const { cache } = require("../middlewares/cacheMiddleware");

// ✅ Main search endpoint - cached for 5 minutes
router.get("/", cache(300), async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20, brand, category, minPrice, maxPrice, sort } = req.query;

    const result = await SearchService.search(q, {
      page:     Number(page),
      limit:    Number(limit),
      brand,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy:   sort,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Autocomplete - cached for 10 minutes  
router.get("/suggest", cache(600), async (req, res) => {
  try {
    const { q = "", limit = 5 } = req.query;
    if (!q) return res.json([]);

    const suggestions = await SearchService.suggest(q, Number(limit));
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reindex", async (req, res) => {
  try {
    const result = await SearchService.indexAllProducts();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;