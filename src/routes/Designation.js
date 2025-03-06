const express = require("express");
const router = express.Router(); 

const DesignationController = require("../controller/Designation");
router.get("/getDesignation", DesignationController.getDesignation);
router.post("/addDesignation", DesignationController.addDesignation);
router.put("/designation/:id", DesignationController.updateDesignation)
router.delete("/designation/:id",DesignationController.deleteDesignation)

module.exports = router; 
