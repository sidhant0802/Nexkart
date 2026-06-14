require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL;

(async () => {
  await mongoose.connect(MONGO);
  require("./src/models/Seller");
  const Seller = mongoose.model("Seller");

  const email    = "seller@techhub.com";
  const password = "techhub123";

  const hash = await bcrypt.hash(password, 10);
  await Seller.updateOne({ email }, { $set: { password: hash } });

  console.log(`\n✅ Password set for ${email}`);
  console.log(`   Login with: ${email} / ${password}\n`);
  process.exit(0);
})();
