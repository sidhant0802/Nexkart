const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/sectionItemController");
const { uploadToCloudinary } = require("../middlewares/uploadToCloudinary"); // ✅ ADD

// public
router.get("/", ctrl.getBySection);

// admin
router.get("/all",              ctrl.getAllForAdmin);
router.get("/grouped",          ctrl.getGroupedForAdmin);

router.post("/",
  uploadToCloudinary(["image"]), // ✅ ADD
  ctrl.createItem
);
router.post("/bulk",
  uploadToCloudinary(["image"]), // ✅ ADD
  ctrl.bulkCreate
);

router.patch("/reorder",            ctrl.reorderItems);
router.patch("/toggle-bulk",        ctrl.bulkToggle);
router.patch("/rename-subcategory", ctrl.renameSubcategory);
router.patch("/:id",
  uploadToCloudinary(["image"]), // ✅ ADD
  ctrl.updateItem
);
router.delete("/:id", ctrl.deleteItem);

module.exports = router;