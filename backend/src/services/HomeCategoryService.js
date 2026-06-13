const HomeCategory = require('../models/HomeCategory');

class HomeCategoryService {

  // Create a single home category
  async createHomeCategory(homeCategory) {
    return await HomeCategory.create(homeCategory);
  }

  // Create multiple home categories or return existing ones
  async createCategories(homeCategories) {
    const existingCategories = await HomeCategory.find();
    if (existingCategories.length === 0) {
      return await HomeCategory.insertMany(homeCategories);
    }
    return existingCategories;
  }

  // Update an existing home category
  async updateHomeCategory(category, id) {
    const existingCategory = await HomeCategory.findById(id);
    if (!existingCategory) {
      throw new Error("Category not found");
    }
    return await HomeCategory.findByIdAndUpdate(
      existingCategory._id,
      category,
      { new: true }
    );
  }

  // Get all home categories
  async getAllHomeCategories() {
    return await HomeCategory.find();
  }

  // ── NEW ──────────────────────────────────────────

  // Get by section
  async getCategoriesBySection(section) {
    return await HomeCategory.find({ section }).sort({ createdAt: 1 });
  }

  // Add a single category (admin)
  async addHomeCategory(data) {
    return await HomeCategory.create(data);
  }

  // Delete a category (admin)
  async deleteHomeCategory(id) {
    const cat = await HomeCategory.findByIdAndDelete(id);
    if (!cat) throw new Error("Category not found");
    return cat;
  }
}

module.exports = new HomeCategoryService();