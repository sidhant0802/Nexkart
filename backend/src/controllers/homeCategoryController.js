const HomeCategoryService = require('../services/HomeCategoryService');
const HomeService         = require('../services/HomeService');

class HomeCategoryController {

  // POST /home/categories
  async createHomeCategories(req, res) {
    try {
      const homeCategories = req.body;
      const categories     = await HomeCategoryService.createCategories(homeCategories);
      const home           = await HomeService.createHomePageData(categories);
      return res.status(202).json(home);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /home/home-category
  async getHomeCategory(req, res) {
    try {
      const categories = await HomeCategoryService.getAllHomeCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // PATCH /home/home-category/:id
  async updateHomeCategory(req, res) {
    try {
      const id             = req.params.id;
      const homeCategory   = req.body;
      const updatedCategory = await HomeCategoryService.updateHomeCategory(homeCategory, id);
      return res.status(200).json(updatedCategory);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ── NEW ──────────────────────────────────────────

  // POST /home/home-category
  // body: { name, image, categoryId, section }
  async addHomeCategory(req, res) {
    try {
      const data    = req.body;
      const created = await HomeCategoryService.addHomeCategory(data);
      return res.status(201).json(created);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // DELETE /home/home-category/:id
  async deleteHomeCategory(req, res) {
    try {
      const { id } = req.params;
      await HomeCategoryService.deleteHomeCategory(id);
      return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /home/home-category/section/:section
  async getBySectionHomeCategory(req, res) {
    try {
      const { section } = req.params;
      const categories  = await HomeCategoryService.getCategoriesBySection(section);
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new HomeCategoryController();