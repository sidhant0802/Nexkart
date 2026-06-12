const mongoose = require('mongoose');
const { Schema } = mongoose;

const homeCategorySchema = new Schema({
  name: {
    type:     String,
    required: true,
  },
  image: {
    type:     String,
    required: true,
  },
  categoryId: {
    type:     String,
    required: true,
  },
  section: {
    type: String,
    enum: [
      // existing uppercase in DB
      "GRID",
      "SHOP_BY_CATEGORIES",
      "ELECTRIC_CATEGORIES",
      "DEALS",
      // new lowercase
      "men",
      "women",
      "electronics",
      "fashion",
      "lightning",
    ],
    required: true,
  },
}, { timestamps: true });

const HomeCategory = mongoose.model('HomeCategory', homeCategorySchema);
module.exports = HomeCategory;