const Banner = require("../models/Banner");

class BannerController {

  // GET /admin/banners
  async getAllBanners(req, res) {
    try {
      const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
      return res.status(200).json(banners);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // GET /banners (public — only active)
  async getActiveBanners(req, res) {
    try {
      const banners = await Banner
        .find({ isActive: true })
        .sort({ order: 1, createdAt: 1 });
      return res.status(200).json(banners);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /admin/banners
  async createBanner(req, res) {
    try {
      const data = req.body;
      const last  = await Banner.findOne().sort({ order: -1 });
      data.order  = last ? last.order + 1 : 0;

      const banner = new Banner(data);
      await banner.save();
      return res.status(201).json(banner);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH /admin/banners/:id
  async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const banner  = await Banner.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!banner) return res.status(404).json({ error: "Banner not found" });
      return res.status(200).json(banner);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /admin/banners/:id
  async deleteBanner(req, res) {
    try {
      const banner = await Banner.findByIdAndDelete(req.params.id);
      if (!banner) return res.status(404).json({ error: "Banner not found" });
      return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH /admin/banners/reorder
  async reorderBanners(req, res) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids))
        return res.status(400).json({ error: "ids must be an array" });

      await Promise.all(
        ids.map((id, index) =>
          Banner.findByIdAndUpdate(id, { order: index }, { new: true })
        )
      );

      const banners = await Banner.find().sort({ order: 1 });
      return res.status(200).json(banners);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BannerController();