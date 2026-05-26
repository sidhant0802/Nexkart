const mongoose = require('mongoose');
const DataInitializationService = require('../services/DataInitializationService');

require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // ✅ PERFORMANCE TUNING
      maxPoolSize:              50,      // ← max simultaneous connections (Atlas M0 limit)
      minPoolSize:              10,      // ← keep 10 ready always
      socketTimeoutMS:          45000,   // ← timeout if query stuck
      serverSelectionTimeoutMS: 5000,    // ← fail fast if Mongo down
      family:                   4,       // ← prefer IPv4 (faster)

      // ✅ Performance flags
      autoIndex:                false,   // ← don't build indexes on connect (we did it in indexes.js)
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Pool size: ${conn.connection.client.options.maxPoolSize}`);

    DataInitializationService.initializeAdminUser();
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;