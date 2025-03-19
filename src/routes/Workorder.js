const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.js");

const WorkderController = require("../controller/WorkOrder");

// Get all work orders - accessible to admin and managers
router.get("/getWorkOrder", protect, WorkderController.getWorkorder);

// Client-initiated work order creation
router.post("/addWorkOrder", protect, authorize("client"), WorkderController.addWorkorder);

// Update work order status - admin and managers only
router.put('/updateStatus/:id', protect, authorize("admin", "siteManager"), WorkderController.updateStatus);

// Delete work order - admin only
router.delete("/Workorder/:id", protect, authorize("admin"), WorkderController.deleteWorkorder);

// Add comment to work order - accessible to all authenticated users
router.post("/Workorder/:id/comment", protect, WorkderController.addComment);

module.exports = router;