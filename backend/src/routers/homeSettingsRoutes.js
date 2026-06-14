const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/homeSettingsController");

router.get("/",       ctrl.getSettings);
router.patch("/",     ctrl.updateSettings);
router.patch("/tabs", ctrl.updateTabs);

module.exports = router;