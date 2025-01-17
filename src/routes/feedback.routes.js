const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getFeedback,
  getSingleFeedback,
  createFeedback,
  addFeedbackResponse,
  updateFeedbackStatus,
  escalateFeedback,
  resolveFeedback,
} = require("../controller/feedback.controller");

router.use(protect); // Protect all routes

// Get all feedback
router.get("/", getFeedback);

// Get single feedback
router.get("/:id", getSingleFeedback);

// Create feedback (client only)
router.post("/", authorize("client"), createFeedback);

// Add response to feedback
router.post(
  "/:id/response",
  authorize("siteManager", "assistantManager", "middleManagement"),
  addFeedbackResponse
);

// Update feedback status
router.put(
  "/:id/status",
  authorize("siteManager", "assistantManager", "middleManagement"),
  updateFeedbackStatus
);

// Escalate feedback
router.put(
  "/:id/escalate",
  authorize("siteManager", "assistantManager"),
  escalateFeedback
);

// Mark feedback as resolved
router.put(
  "/:id/resolve",
  authorize("siteManager", "assistantManager", "middleManagement"),
  resolveFeedback
);

module.exports = router;
