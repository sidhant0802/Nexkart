const HomeCategorySection = require('../domain/HomeCategorySection');
const Deal                = require('../models/Deal');
const Banner              = require('../models/Banner');
const SectionItem         = require('../models/SectionItem');
const HomeCategory        = require('../models/HomeCategory');
const HomeSettings        = require('../models/HomeSettings');
const Brand               = require('../models/Brand');

class HomeService {

  async createHomePageData(allCategories) {

    // ── Existing HomeCategory sections (in-memory filter — fast) ──
    const gridCategories      = allCategories.filter(c => c.section === HomeCategorySection.GRID);
    const shopByCategories    = allCategories.filter(c => c.section === HomeCategorySection.SHOP_BY_CATEGORIES);
    const electricCategories  = allCategories.filter(c => c.section === HomeCategorySection.ELECTRIC_CATEGORIES);
    const dealCategories      = allCategories.filter(c => c.section === HomeCategorySection.DEAL);

    // ══════════════════════════════════════════════════════
    // ✅ MEGA OPTIMIZATION: Run ALL queries in PARALLEL
    // ══════════════════════════════════════════════════════
    const [
      // Deals
      existingDeals,

      // Banners
      banners,

      // 6 section items (active for home scroll)
      menItems, womenItems, electronicsItems,
      fashionItems, lightningItems, furnitureItems,

      // 6 view all items
      menViewAll, womenViewAll, electronicsViewAll,
      fashionViewAll, dealsViewAll, furnitureViewAll,

      // Home settings
      homeSettings,
    ] = await Promise.all([

      // ✅ Deals — .lean() + projection
      Deal.find()
        .populate("category", "name categoryId image")  // only needed fields
        .lean(),

      // ✅ Banners
      Banner.find({ isActive: true })
        .select("image link order title subtitle")
        .sort({ order: 1 })
        .lean(),

      // ✅ Active section items
      SectionItem.find({ section: "men",         isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "women",       isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "electronics", isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "fashion",     isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "lightning",   isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "furniture",   isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),

      // ✅ View All items
      SectionItem.find({ section: "men",         showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "women",       showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "electronics", showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "fashion",     showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "lightning",   showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "furniture",   showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),

      // ✅ Home settings
      HomeSettings.findOne().lean(),
    ]);

    // ── Create deals if none exist (rare) ──
    let createdDeals = existingDeals;
    if (existingDeals.length === 0 && dealCategories.length > 0) {
      const deals = dealCategories.map(
        (category) => new Deal({ discount: 10, category })
      );
      const inserted = await Deal.insertMany(deals);
      createdDeals = await Deal.find({ _id: { $in: inserted.map(d => d._id) } })
        .populate("category", "name categoryId image")
        .lean();
    }

    // ── Use defaults if no settings ──
    let settings = homeSettings;
    if (!settings) {
      settings = await HomeSettings.create({});
    }

    // ── Brands for home page (lazy load only if needed) ──
    let homeBrands = [];
    if (settings.showBrandsOnHome) {
      const brandQuery = { isActive: { $ne: false } };
      const brandFields = "name slug logo featured";   // ✅ minimal fields

      if (settings.brandSortMode === "random") {
        // ✅ For random, fetch all once and shuffle in memory (faster than re-query)
        const allBrands = await Brand
          .find(brandQuery)
          .select(brandFields)
          .lean();

        // Fisher-Yates shuffle
        for (let i = allBrands.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allBrands[i], allBrands[j]] = [allBrands[j], allBrands[i]];
        }
        homeBrands = allBrands.slice(0, settings.brandDisplayCount);
      } else {
        let brandSort = {};
        switch (settings.brandSortMode) {
          case "featured_first": brandSort = { featured: -1, name: 1 };  break;
          case "alphabetical":   brandSort = { name: 1 };                break;
          case "newest":         brandSort = { createdAt: -1 };          break;
          default:               brandSort = { featured: -1, name: 1 };
        }
        homeBrands = await Brand
          .find(brandQuery)
          .select(brandFields)
          .sort(brandSort)
          .limit(settings.brandDisplayCount)
          .lean();
      }
    }

    return {
      grid:               gridCategories,
      shopByCategories,
      electricCategories,
      deals:              createdDeals,
      dealCategories,

      banners,

      menItems,
      womenItems,
      electronicsItems,
      fashionItems,
      lightningItems,
      furnitureItems,

      menViewAll,
      womenViewAll,
      electronicsViewAll,
      fashionViewAll,
      dealsViewAll,
      furnitureViewAll,

      homeSettings: {
        featuredProductCount: settings.featuredProductCount,
        featuredSortMode:     settings.featuredSortMode,
        featuredTabs:         settings.featuredTabs,
        brandDisplayCount:    settings.brandDisplayCount,
        brandSortMode:        settings.brandSortMode,
        showBrandsOnHome:     settings.showBrandsOnHome,
      },

      homeBrands,
    };
  }

  async getHomePageData() {
    // ✅ Use .lean() + only fields needed
    const allCategories = await HomeCategory
      .find()
      .select("section category image categoryId name")
      .lean();

    return this.createHomePageData(allCategories);
  }
}

module.exports = new HomeService();