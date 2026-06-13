const HomeCategorySection = require('../domain/HomeCategorySection');
const Deal                = require('../models/Deal');
const Banner              = require('../models/Banner');
const SectionItem         = require('../models/SectionItem');
const HomeCategory        = require('../models/HomeCategory');
const HomeSettings        = require('../models/HomeSettings');
const Brand               = require('../models/Brand');

// ✅ Helper: normalize section names so old DB ("GRID") + new ("grid") both work
const norm = (s) => String(s || "").toLowerCase().trim();

class HomeService {

  async createHomePageData(allCategories) {

    // ✅ Case-insensitive section filtering
    const gridCategories      = allCategories.filter(c => norm(c.section) === "grid");
    const shopByCategories    = allCategories.filter(c => norm(c.section) === "shop_by_categories");
    const electricCategories  = allCategories.filter(c => norm(c.section) === "electric_categories");
    const dealCategories      = allCategories.filter(c =>
      ["deal", "deals"].includes(norm(c.section))
    );

    const [
      existingDeals,
      banners,
      menItems, womenItems, electronicsItems,
      fashionItems, lightningItems, furnitureItems,
      menViewAll, womenViewAll, electronicsViewAll,
      fashionViewAll, dealsViewAll, furnitureViewAll,
      homeSettings,
    ] = await Promise.all([
      Deal.find().populate("category", "name categoryId image").lean(),
      Banner.find({ isActive: true }).select("image link order title subtitle").sort({ order: 1 }).lean(),

      SectionItem.find({ section: "men",         isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "women",       isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "electronics", isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "fashion",     isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "lightning",   isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),
      SectionItem.find({ section: "furniture",   isActive: true }).select("title image link order section").sort({ order: 1 }).lean(),

      SectionItem.find({ section: "men",         showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "women",       showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "electronics", showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "fashion",     showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "lightning",   showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),
      SectionItem.find({ section: "furniture",   showInViewAll: true }).select("title image link order section subcategory").sort({ subcategory: 1, order: 1 }).lean(),

      HomeSettings.findOne().lean(),
    ]);

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

    let settings = homeSettings;
    if (!settings) {
      settings = await HomeSettings.create({});
    }

    let homeBrands = [];
    if (settings.showBrandsOnHome) {
      const brandQuery  = { isActive: { $ne: false } };
      const brandFields = "name slug logo featured";

      if (settings.brandSortMode === "random") {
        const allBrands = await Brand.find(brandQuery).select(brandFields).lean();
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
        homeBrands = await Brand.find(brandQuery).select(brandFields).sort(brandSort).limit(settings.brandDisplayCount).lean();
      }
    }

    return {
      grid:               gridCategories,
      shopByCategories,
      electricCategories,
      deals:              createdDeals,
      dealCategories,
      banners,
      menItems, womenItems, electronicsItems,
      fashionItems, lightningItems, furnitureItems,
      menViewAll, womenViewAll, electronicsViewAll,
      fashionViewAll, dealsViewAll, furnitureViewAll,
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
    const allCategories = await HomeCategory
      .find()
      .select("section category image categoryId name")
      .lean();
    return this.createHomePageData(allCategories);
  }
}

module.exports = new HomeService();
