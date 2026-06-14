require("dotenv").config();
const mongoose = require("mongoose");

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL || process.env.DATABASE_URL || process.env.MONGO_URL;

console.log("Trying connection...");
console.log("Found env:", MONGO ? "✓" : "✗ NONE");

if (!MONGO) {
  console.log("\n❌ No MongoDB URL in .env file");
  console.log("Add one of: MONGO_URI, MONGODB_URI, DB_URL, DATABASE_URL\n");
  process.exit(1);
}

const Seller = require("./src/models/Seller");

(async () => {
  await mongoose.connect(MONGO);
  const sellers = await Seller.find({}, "email sellerName accountStatus");
  console.log(`\n📋 Found ${sellers.length} sellers:\n`);
  sellers.forEach((s, i) => {
    console.log(`${i + 1}. ${s.sellerName}`);
    console.log(`   📧 ${s.email}`);
    console.log(`   🔵 ${s.accountStatus}\n`);
  });
  process.exit(0);
})();
