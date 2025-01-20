const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - project
 *         - client
 *         - issue
 *       properties:
 *         project:
 *           type: string
 *           description: Reference to project ID
 *         client:
 *           type: string
 *           description: Reference to client user ID
 *         issue:
 *           type: string
 *           description: Description of the issue
 *         status:
 *           type: string
 *           enum: [pending, inProgress, resolved, escalated]
 *           description: Current status of the feedback
 *         responses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               responder:
 *                 type: string
 *                 description: Reference to responder user ID
 *               message:
 *                 type: string
 *                 description: Response message
 *               clientSatisfied:
 *                 type: boolean
 *                 description: Whether the client is satisfied with the response
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp of the response
 *         escalationLevel:
 *           type: string
 *           enum: [siteManager, assistantManager, middleManagement]
 *           description: Current escalation level
 *         escalationTime:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when feedback was escalated
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when feedback was resolved
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when feedback was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when feedback was last updated
 */
const feedbackSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issue: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "resolved", "escalated"],
      default: "pending",
    },
    responses: [
      {
        responder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        clientSatisfied: {
          type: Boolean,
          default: null,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    escalationLevel: {
      type: String,
      enum: ["siteManager", "assistantManager", "middleManagement"],
      default: "siteManager",
    },
    escalationTime: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
