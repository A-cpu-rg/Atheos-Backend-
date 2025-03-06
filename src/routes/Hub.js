const express = require("express");
const router = express.Router();
const HubtittleController = require("../controller/Hub");

router.get("/getHub", HubtittleController.getHub);
router.post("/addHub", HubtittleController.addHub);
router.put("/Hub/:id", HubtittleController.updateHub);
router.delete("/Hub/:id", HubtittleController.deleteHub);

module.exports = router;
