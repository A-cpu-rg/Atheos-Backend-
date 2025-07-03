const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.js");

const ComplaintController = require("../controller/Complaint");

// Get all complaints - accessible based on user role filters
router.get("/getallcomplaints", 
    protect, authorize("middleManagement","client","siteManager","assistantManager","topManagement","permanentReliever","housekeeper"),
    ComplaintController.getComplaint
);

// Create complaint - primarily for clients
router.post("/", 
    protect, 
    authorize("client","siteManager","assistantManager","housekeeper"), 
    ComplaintController.addComplaint
);

// Get a specific complaint
router.get("/:id", 
    protect,authorize("middleManagement","client","siteManager","assistantManager","topManagement","permanentReliever","housekeeper"),
    ComplaintController.getComplaintById
);

// Add response to a complaint
router.post("/:id/responses", 
    protect,authorize("middleManagement","client","siteManager","assistantManager","topManagement","permanentReliever","housekeeper"), 
    ComplaintController.addResponse
);

// Respond to solution with satisfaction (Yes/No)
router.post("/:id/responses/:responseId/satisfaction", 
    protect, 
    authorize("client"), 
    ComplaintController.respondToSolution
);

// Update complaint status, priority, etc.
router.put("/:id", 
    protect, authorize("middleManagement","client","siteManager","assistantManager","topManagement"),
    ComplaintController.updateStatus
);

// Delete complaint - admin only
router.delete("/:id", 
    protect, 
    authorize("admin", "middleManagement","topManagement"), 
    ComplaintController.deleteComplaint
);

// Get dashboard statistics
router.get("/stats/dashboard", 
    protect, authorize("middleManagement","client","siteManager","assistantManager","topManagement"),
    ComplaintController.getDashboardStats
);

// Cron-like endpoint to check and escalate complaints based on time
router.post("/system/check-escalation", 
    protect, 
    authorize("admin", "middleManagement","middleManagement"), 
    ComplaintController.checkAndEscalateComplaints
);

module.exports = router;