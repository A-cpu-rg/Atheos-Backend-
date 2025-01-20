const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - client
 *         - siteManager
 *         - assistantManager
 *       properties:
 *         name:
 *           type: string
 *           description: Project name
 *         description:
 *           type: string
 *           description: Project description
 *         client:
 *           type: string
 *           description: Reference to client user ID
 *         siteManager:
 *           type: string
 *           description: Reference to site manager user ID
 *         assistantManager:
 *           type: string
 *           description: Reference to assistant manager user ID
 *         workers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of worker IDs assigned to the project
 *         status:
 *           type: string
 *           enum: [active, completed, suspended]
 *           description: Current project status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the project was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the project was last updated
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    siteManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assistantManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
