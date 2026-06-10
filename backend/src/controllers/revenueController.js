const RevenueService = require("../services/RevenuewService");

class RevenueController {
  async getRevenueChart(req, res) {
    try {
      const type = req.query.type || "daily";
      const revenue = await RevenueService.getRevenueChartByType(type, req.seller._id);
      return res.status(200).json(revenue);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ✅ NEW - Dashboard stats
  async getDashboardStats(req, res) {
    try {
      const stats = await RevenueService.getDashboardStats(req.seller._id);
      return res.status(200).json(stats);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new RevenueController();