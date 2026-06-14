// backend/seedListings.js
// For each product, create 2-5 seller listings with varying prices
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://sidhant:sidhant08@cluster0.evfoihc.mongodb.net/Nexkart?retryWrites=true&w=majority&appName=Cluster0";

// Base prices per product title (lowest seller price)
const BASE_PRICES = {
  // Apple
  "Apple iPhone 15 Pro Max 256GB": 144900,
  "Apple iPhone 15 Pro 128GB": 119900,
  "Apple iPhone 15 128GB": 69900,
  "Apple iPhone 14 128GB": 57999,
  "Apple MacBook Air M2 13-inch 256GB": 99990,
  "Apple MacBook Pro M3 14-inch 512GB": 159900,
  "Apple AirPods Pro 2nd Gen": 22900,
  "Apple Watch Series 9 GPS 45mm": 41900,
  // Samsung
  "Samsung Galaxy S24 Ultra 5G 256GB": 124999,
  "Samsung Galaxy S24 5G 128GB": 69999,
  "Samsung Galaxy A54 5G 128GB": 32999,
  "Samsung Galaxy M14 5G 128GB": 13499,
  "Samsung Galaxy Buds2 Pro": 13999,
  "Samsung Galaxy Watch6 44mm": 27999,
  "Samsung 1.5 Ton 3 Star Inverter Split AC": 38990,
  "Samsung 55 inch Crystal 4K UHD Smart TV": 49990,
  // OnePlus
  "OnePlus 12 5G 256GB": 64999,
  "OnePlus 11R 5G 128GB": 39999,
  "OnePlus Nord CE 3 Lite 5G 128GB": 17999,
  "OnePlus Buds Pro 2": 9999,
  // Xiaomi
  "Xiaomi 14 5G 256GB": 64999,
  "Redmi Note 13 Pro 5G": 23999,
  "Xiaomi Smart Band 8": 2999,
  // Realme
  "Realme 12 Pro+ 5G 256GB": 27999,
  "Realme Narzo 60 Pro 5G": 19999,
  // Google
  "Google Pixel 8 Pro 256GB": 96999,
  "Google Pixel 8 128GB": 64999,
  // Nothing
  "Nothing Phone (2) 256GB": 41999,
  "Nothing Phone (2a) 128GB": 23999,
  // Vivo
  "Vivo X100 Pro 5G": 79999,
  "Vivo V30 Pro 5G": 36999,
  // Oppo
  "OPPO Reno 11 Pro 5G": 34999,
  // Motorola
  "Motorola Edge 50 Pro 5G": 31999,
  "Motorola G84 5G": 18999,
  // Poco
  "POCO X6 Pro 5G": 22999,
  // iQOO
  "iQOO 12 5G 256GB": 52999,
  // Dell
  "Dell XPS 13 Plus": 139990,
  "Dell Inspiron 15 3520": 49990,
  "Dell G15 5530 Gaming Laptop": 94990,
  // HP
  "HP Pavilion 15 Laptop": 64990,
  "HP Victus 15 Gaming Laptop": 62990,
  "HP 15s Laptop": 37990,
  // Asus
  "ASUS ROG Strix G16 Gaming": 109990,
  "ASUS Vivobook 15": 51990,
  // Lenovo
  "Lenovo IdeaPad Slim 3": 41990,
  "Lenovo Legion 5 Gaming": 99990,
  // Acer
  "Acer Aspire 5": 49990,
  // Audio
  "Sony WH-1000XM5 Wireless": 26990,
  "Sony WF-1000XM5 Earbuds": 22990,
  "Sony Bravia 55-inch 4K Google TV": 74990,
  "Bose QuietComfort Ultra Headphones": 38900,
  "Bose QuietComfort 45": 26900,
  "JBL Tune 770NC": 6999,
  "JBL Flip 6 Bluetooth Speaker": 7499,
  "boAt Rockerz 450 Bluetooth Headphones": 1499,
  "boAt Airdopes 141 TWS": 1099,
  "boAt Wave Call Smart Watch": 1499,
  // Watches
  "Noise ColorFit Pro 4": 1799,
  "Noise ColorFit Ultra 3": 3499,
  "Fire-Boltt Ninja Call Pro Plus": 1599,
  // Home
  "LG 55-inch OLED C3 4K Smart TV": 119990,
  "LG 1.5 Ton 5 Star AI DUAL Inverter Split AC": 47990,
  "Daikin 1.5 Ton 5 Star Inverter Split AC": 51990,
  "Voltas 1.5 Ton 3 Star Inverter Split AC": 33490,
  // Footwear
  "Nike Air Jordan 1 Mid": 9495,
  "Nike Air Force 1 '07": 7495,
  "Nike Air Max 90": 8395,
  "Adidas Ultraboost 22": 13999,
  "Adidas Stan Smith Sneakers": 6499,
  "Puma RS-X Sneakers": 5999,
  "Reebok Classic Leather Sneakers": 4899,
  "Bata Formal Leather Shoes": 1799,
  "Woodland Leather Casual Boots": 2997,
  "Crocs Classic Clog": 2697,
  "Peter England Leather Formal Shoes": 1999,
  // Apparel
  "Nike Sportswear Club T-Shirt": 1095,
  "Adidas Essentials 3-Stripes T-Shirt": 1099,
  "Puma Essentials Logo T-Shirt": 779,
  "Allen Solly Slim Fit Formal Shirt": 1249,
  "Allen Solly Casual Check Shirt": 999,
  "Peter England Slim Fit Formal Shirt": 999,
  "Van Heusen Slim Fit Shirt": 1149,
  "Levi's 511 Slim Fit Jeans": 2699,
  "Levi's 501 Original Fit Jeans": 2999,
  "Zara Slim Fit Linen Shirt": 2790,
  "Zara Floral Print Midi Dress": 3490,
  "Zara Oversized Blazer": 5990,
  "H&M Cotton Maxi Dress": 1999,
  "H&M Regular Fit T-Shirt": 399,
  "Biba Printed Anarkali Kurta": 1799,
  "Biba Floral Print Suit Set": 2399,
  "Fabindia Cotton Saree": 2790,
  // Furniture
  "IKEA MALM Bed Frame Queen": 18990,
  "IKEA POÄNG Armchair": 11990,
  "Urban Ladder Castello Sofa": 54990,
  "Wakefit Orthopedic Memory Foam Mattress Queen": 14999,
};

// Default base price by category if title not found
const DEFAULT_PRICES = {
  mobiles: 25000,
  laptops: 55000,
  headphones_headsets: 5000,
  smart_watches: 4000,
  home_furniture: 30000,
  men: 1500,
  women: 1800,
  men_t_shirts: 800,
  men_formal_shirts: 1200,
  men_casual_shirts: 1100,
  men_formal_shoes: 2000,
  men_footwear: 2500,
  men_sneakers: 4000,
  women_sarees: 2200,
  women_western_wear: 2500,
};

// Helpers
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const disc = (mrp, sell) => Math.round(((mrp - sell) / mrp) * 100);

async function seedListings() {
  try {
    console.log("🔄 Connecting...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    const Product = require("./src/models/Product");
    const Seller = require("./src/models/Seller");
    const ProductListing = require("./src/models/ProductListing");
    const Brand = require("./src/models/Brand");
    const Category = require("./src/models/Category");

    const sellers = await Seller.find({ accountStatus: "ACTIVE" });
    if (sellers.length === 0) throw new Error("No active sellers found!");
    console.log(`✅ Found ${sellers.length} active sellers`);

    const products = await Product.find({});
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      throw new Error("No products found! Run seedProductsMaster.js first.");
    }

    console.log("\n🗑️  Clearing existing listings...");
    await ProductListing.deleteMany({});

    console.log(`\n📦 Creating multi-seller listings...\n`);
    let totalListings = 0;

    for (const product of products) {
      // Get base selling price for this product
      let basePrice = BASE_PRICES[product.title];

      if (!basePrice) {
        // Fall back to category-based default price
        const cat = await Category.findById(product.category);
        basePrice = DEFAULT_PRICES[cat?.categoryId] || 1000;
      }

      // 2 to 5 random sellers will sell this product
      const numSellers = randInt(2, Math.min(5, sellers.length));
      const shuffled = [...sellers].sort(() => 0.5 - Math.random());
      const chosenSellers = shuffled.slice(0, numSellers);

      const listingsCreated = [];

      for (let i = 0; i < chosenSellers.length; i++) {
        const seller = chosenSellers[i];

        // First seller: lowest price (basePrice)
        // Others: 2-15% higher
        const priceMultiplier = i === 0 ? 1 : (1 + rand(0.02, 0.15));
        const sellingPrice = Math.round(basePrice * priceMultiplier);

        // MRP is 15-40% higher than selling price
        const mrpPrice = Math.round(sellingPrice * (1 + rand(0.15, 0.40)));

        // Random seller rating between 3.8 and 4.9
        const sellerRating = parseFloat(rand(3.8, 4.9).toFixed(1));
        const sellerTotalReviews = randInt(50, 2000);

        // Random delivery 1-7 days
        const deliveryDays = randInt(1, 7);

        // Random stock 10-100
        const quantity = randInt(10, 100);

        const listing = await new ProductListing({
          product: product._id,
          seller: seller._id,
          mrpPrice,
          sellingPrice,
          discountPercent: disc(mrpPrice, sellingPrice),
          quantity,
          deliveryDays,
          sellerRating,
          sellerTotalReviews,
          isActive: true,
          totalSold: randInt(0, 500),
        }).save();

        listingsCreated.push(listing);
        totalListings++;
      }

      // Update product with aggregates
      const prices = listingsCreated.map(l => l.sellingPrice);
      const mrpPrices = listingsCreated.map(l => l.mrpPrice);
      const stocks = listingsCreated.map(l => l.quantity);
      const cheapest = listingsCreated.reduce((a, b) => a.sellingPrice < b.sellingPrice ? a : b);

      await Product.findByIdAndUpdate(product._id, {
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        minMrpPrice: Math.min(...mrpPrices),
        totalSellers: listingsCreated.length,
        totalStock: stocks.reduce((a, b) => a + b, 0),
        defaultListing: cheapest._id,
      });

      const titleShort = product.title.length > 45 
        ? product.title.slice(0, 42) + "..." 
        : product.title.padEnd(45);
      console.log(`  ✅ ${titleShort} → ${listingsCreated.length} sellers, ₹${Math.min(...prices).toLocaleString('en-IN')} - ₹${Math.max(...prices).toLocaleString('en-IN')}`);
    }

    // Update brand product counts
    console.log("\n🔄 Updating brand product counts...");
    const brandCounts = {};
    products.forEach(p => { brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });
    for (const [slug, n] of Object.entries(brandCounts)) {
      await Brand.updateOne({ slug }, { $set: { productCount: n } });
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎉 ${totalListings} listings created across ${products.length} products!`);
    console.log(`📊 Average ${(totalListings / products.length).toFixed(1)} sellers per product`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e.message);
    console.error(e);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedListings();