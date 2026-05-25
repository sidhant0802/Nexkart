const HomeSettings = require("../models/HomeSettings");

class HomeSettingsController {

  // GET /admin/home-settings
  async getSettings(req, res) {
    try {
      let settings = await HomeSettings.findOne();
      if (!settings) {
        settings = await HomeSettings.create({});
      }
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH /admin/home-settings
  async updateSettings(req, res) {
    try {
      const data = req.body;
      let settings = await HomeSettings.findOne();

      if (!settings) {
        settings = await HomeSettings.create(data);
      } else {
        settings = await HomeSettings.findByIdAndUpdate(
          settings._id,
          { $set: data },
          { new: true, runValidators: true }
        );
      }

      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH /admin/home-settings/tabs
  // Update just the tabs array
  async updateTabs(req, res) {
    try {
      const { tabs } = req.body;
      if (!Array.isArray(tabs)) {
        return res.status(400).json({ error: "tabs must be array" });
      }

      let settings = await HomeSettings.findOne();
      if (!settings) settings = await HomeSettings.create({});

      settings = await HomeSettings.findByIdAndUpdate(
        settings._id,
        { $set: { featuredTabs: tabs } },
        { new: true }
      );

      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new HomeSettingsController();