require("dotenv").config();
const mongoose = require("mongoose");
(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL);
  require("./src/models/Seller");
  const Seller = mongoose.model("Seller");
  await Seller.updateOne(
    { email: "seller@techhub.com" },
    { $set: { codEnabled: true, codMaxAmount: 50000 } }
  );
  console.log("✅ COD enabled for TechHub up to ₹50,000");
  process.exit(0);
})();
