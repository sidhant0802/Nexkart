const express                = require('express');
const homeCategoryController = require('../controllers/homeCategoryController');
const HomeService            = require('../services/HomeService');

const router = express.Router();

// ── Home Page Data (used by frontend CustomerSlice) ────────
// GET /home-page
router.get('/', async (req, res) => {
  try {
    const data = await HomeService.getHomePageData();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ── Home Category CRUD ─────────────────────────────────────
router.post('/categories',                    homeCategoryController.createHomeCategories);
router.get('/home-category',                  homeCategoryController.getHomeCategory);
router.patch('/home-category/:id',            homeCategoryController.updateHomeCategory);

// NEW
router.post('/home-category',                 homeCategoryController.addHomeCategory);
router.delete('/home-category/:id',           homeCategoryController.deleteHomeCategory);
router.get('/home-category/section/:section', homeCategoryController.getBySectionHomeCategory);

module.exports = router;