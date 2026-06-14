const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false },
  fullName:  { type: String, required: true, trim: true },
  mobile:    { type: String, trim: true },
  role:      { type: String, default: "ROLE_ADMIN" },
  accountStatus: { type: String, default: "active" },
  authMethod:    { type: String, default: "password" },
  isEmailVerified: { type: Boolean, default: true },
  loginCount: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    // Check if admin already exists
    const existing = await User.findOne({ email: "admin@nexkart.com" });
    if (existing) {
      console.log("⚠️  Admin already exists!");
      console.log("📧 Email   :", existing.email);
      console.log("👤 Role    :", existing.role);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create admin
    const admin = new User({
      fullName:  "Super Admin",
      email:     "admin@nexkart.com",
      password:  hashedPassword,
      mobile:    "9999999999",
      role:      "ROLE_ADMIN",
      accountStatus:   "active",
      authMethod:      "password",
      isEmailVerified: true,
    });

    await admin.save();

    console.log("\n🎉 Admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email    : admin@nexkart.com");
    console.log("🔑 Password : Admin@123");
    console.log("👤 Role     : ROLE_ADMIN");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
