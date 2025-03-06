const express = require("express");
const router = express.Router();

const WorkderController = require("../controller/WorkOrder")

router.get("/getWorkOrder" ,WorkderController.getWorkorder);
router.post("/addWorkOrder",WorkderController.addWorkorder);
router.delete("/Workorder/:id",WorkderController.deleteWorkorder);
router.put('/updateStatus/:id', WorkderController.updateStatus);


module.exports=router;