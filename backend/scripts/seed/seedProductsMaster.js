// backend/seedProductsMaster.js
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://sidhant:sidhant08@cluster0.evfoihc.mongodb.net/Nexkart?retryWrites=true&w=majority&appName=Cluster0";

// Same products as before but only catalog info
const productsData = require("./productCatalogData.js");

async function seedProducts() {
  try {
    console.log("🔄 Connecting...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    const Product = require("./src/models/Product");
    const Brand = require("./src/models/Brand");
    const Category = require("./src/models/Category");

    // Get categories
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.categoryId] = c._id; });

    // Get brands
    const brands = await Brand.find({});
    const brandMap = {};
    brands.forEach(b => { brandMap[b.slug] = b; });

    console.log(`✅ ${categories.length} categories, ${brands.length} brands loaded`);

    console.log("\n🗑️  Clearing existing products...");
    await Product.deleteMany({});

    console.log(`\n📦 Seeding ${productsData.length} products...`);
    let count = 0, skipped = 0;

    for (const p of productsData) {
      const brand = brandMap[p.brand];
      const categoryId = categoryMap[p.category];

      if (!brand || !categoryId) {
        skipped++;
        continue;
      }

      await new Product({
        title: p.title,
        description: p.description,
        color: p.color,
        brand: p.brand,
        brandRef: brand._id,
        images: p.images,
        category: categoryId,
        sizes: p.sizes || "",
        // Aggregates default to 0 — will be filled by seedListings.js
        minPrice: 0,
        maxPrice: 0,
        totalSellers: 0,
        totalStock: 0,
      }).save();

      count++;
      if (count % 25 === 0) console.log(`  ✅ ${count} products...`);
    }

    console.log(`\n🎉 ${count} products seeded! (${skipped} skipped)`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("❌", e.message, e);
    process.exit(1);
  }
}

seedProducts();