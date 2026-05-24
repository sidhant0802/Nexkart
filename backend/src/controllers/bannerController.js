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

  // POST /admin/banners
  async createBanner(req, res) {
    try {
      const data = req.body;

      // auto order = last + 1
      const last = await Banner.findOne().sort({ order: -1 });
      data.order = last ? last.order + 1 : 0;

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
      const data = req.body;

      const banner = await Banner.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }

      return res.status(200).json(banner);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /admin/banners/:id
  async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      const banner = await Banner.findByIdAndDelete(id);

      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }

      return res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH /admin/banners/reorder
  // body: { ids: ["id1","id2","id3"] }  ordered array
  async reorderBanners(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }

      const updates = ids.map((id, index) =>
        Banner.findByIdAndUpdate(id, { order: index }, { new: true })
      );

      await Promise.all(updates);
      const banners = await Banner.find().sort({ order: 1 });
      return res.status(200).json(banners);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BannerController();