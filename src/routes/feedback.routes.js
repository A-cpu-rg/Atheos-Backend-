const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.js");
const {
  getFeedback,
  getSingleFeedback,
  createFeedback,
  addFeedbackResponse,
  updateFeedbackStatus,
  escalateFeedback,
  resolveFeedback,
} = require("../controller/feedback.controller");

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Feedback management endpoints
 */

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get all feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/", protect, getFeedback);

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Get single feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getSingleFeedback);

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create feedback (client only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project
 *               - issue
 *             properties:
 *               project:
 *                 type: string
 *                 description: Project ID
 *               issue:
 *                 type: string
 *                 description: Feedback issue description
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       403:
 *         description: Not authorized to create feedback
 *       500:
 *         description: Server error
 */
router.post("/", protect, authorize("client"), createFeedback);

/**
 * @swagger
 * /api/feedback/{id}/response:
 *   post:
 *     summary: Add response to feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Response message
 *     responses:
 *       200:
 *         description: Response added successfully
 *       403:
 *         description: Not authorized to add response
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.post(
  "/:id/response",
  protect,
  authorize("siteManager", "assistantManager", "middleManagement"),
  addFeedbackResponse
);

/**
 * @swagger
 * /api/feedback/{id}/escalate:
 *   put:
 *     summary: Escalate feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - escalationLevel
 *             properties:
 *               escalationLevel:
 *                 type: string
 *                 enum: [siteManager, assistantManager, middleManagement]
 *     responses:
 *       200:
 *         description: Feedback escalated successfully
 *       403:
 *         description: Not authorized to escalate feedback
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/escalate",
  protect,
  authorize("siteManager", "assistantManager"),
  escalateFeedback
);

/**
 * @swagger
 * /api/feedback/{id}/resolve:
 *   put:
 *     summary: Mark feedback as resolved
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback marked as resolved
 *       403:
 *         description: Not authorized to resolve feedback
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/resolve",
  protect,
  authorize("siteManager", "assistantManager", "middleManagement"),
  resolveFeedback
);

module.exports = router;
