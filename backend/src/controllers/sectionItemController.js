const SectionItem = require("../models/SectionItem");

const VALID_SECTIONS = ["men", "women", "electronics", "fashion", "lightning", "furniture"];

class SectionItemController {

  // ── GET /admin/section-items?section=electronics ──
  // Public — only active items (for home page)
  async getBySection(req, res) {
    try {
      const { section } = req.query;

      if (!section) {
        const items = await SectionItem.find({ isActive: true }).sort({ section: 1, order: 1 });
        return res.status(200).json(items);
      }

      if (!VALID_SECTIONS.includes(section)) {
        return res.status(400).json({
          error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}`,
        });
      }

      const items = await SectionItem
        .find({ section, isActive: true })
        .sort({ order: 1 });

      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── GET /admin/section-items/all?section=electronics ──
  // Admin — ALL items (including inactive), grouped by subcategory
  async getAllForAdmin(req, res) {
    try {
      const { section } = req.query;
      const filter = section ? { section } : {};
      const items = await SectionItem.find(filter).sort({ subcategory: 1, order: 1 });
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── GET /admin/section-items/grouped?section=electronics ──
  // Admin — items grouped by subcategory
  async getGroupedForAdmin(req, res) {
    try {
      const { section } = req.query;
      if (!section) {
        return res.status(400).json({ error: "section query param required" });
      }

      const items = await SectionItem.find({ section }).sort({ subcategory: 1, order: 1 });

      // Group by subcategory
      const grouped = {};
      items.forEach((item) => {
        const sub = item.subcategory || "General";
        if (!grouped[sub]) {
          grouped[sub] = [];
        }
        grouped[sub].push(item);
      });

      return res.status(200).json({
        section,
        totalItems:  items.length,
        activeItems: items.filter((i) => i.isActive).length,
        subcategories: Object.keys(grouped),
        groups: grouped,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── POST /admin/section-items ──
  async createItem(req, res) {
    try {
      const data = req.body;

      if (!VALID_SECTIONS.includes(data.section)) {
        return res.status(400).json({
          error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}`,
        });
      }

      const last = await SectionItem.findOne({ section: data.section }).sort({ order: -1 });
      data.order = last ? last.order + 1 : 0;

      const item = new SectionItem(data);
      await item.save();
      return res.status(201).json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── POST /admin/section-items/bulk ──
  // Create multiple items at once
  async bulkCreate(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items array required" });
      }

      // Auto-assign order
      const section = items[0].section;
      const last = await SectionItem.findOne({ section }).sort({ order: -1 });
      let nextOrder = last ? last.order + 1 : 0;

      const withOrder = items.map((item) => ({
        ...item,
        order: nextOrder++,
      }));

      const created = await SectionItem.insertMany(withOrder);
      return res.status(201).json(created);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── PATCH /admin/section-items/:id ──
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const item = await SectionItem.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({ error: "Section item not found" });
      }

      return res.status(200).json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── PATCH /admin/section-items/toggle-bulk ──
  // Toggle multiple items at once
  async bulkToggle(req, res) {
    try {
      const { ids, isActive } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids array required" });
      }

      await SectionItem.updateMany(
        { _id: { $in: ids } },
        { $set: { isActive } }
      );

      return res.status(200).json({ message: `${ids.length} items updated` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── PATCH /admin/section-items/rename-subcategory ──
  // Rename a subcategory across all items
  async renameSubcategory(req, res) {
    try {
      const { section, oldName, newName } = req.body;

      if (!section || !oldName || !newName) {
        return res.status(400).json({ error: "section, oldName, newName required" });
      }

      const result = await SectionItem.updateMany(
        { section, subcategory: oldName },
        { $set: { subcategory: newName } }
      );

      return res.status(200).json({
        message: `Renamed "${oldName}" to "${newName}"`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── DELETE /admin/section-items/:id ──
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const item = await SectionItem.findByIdAndDelete(id);

      if (!item) {
        return res.status(404).json({ error: "Section item not found" });
      }

      return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── PATCH /admin/section-items/reorder ──
  async reorderItems(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }

      const updates = ids.map((id, index) =>
        SectionItem.findByIdAndUpdate(id, { order: index }, { new: true })
      );

      await Promise.all(updates);
      return res.status(200).json({ message: "Reordered successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SectionItemController();