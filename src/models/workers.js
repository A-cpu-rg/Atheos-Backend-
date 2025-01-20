const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Worker:
 *       type: object
 *       required:
 *         - name
 *         - contactNumber
 *         - project
 *         - designation
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the worker.
 *         name:
 *           type: string
 *           description: The name of the worker.
 *         contactNumber:
 *           type: string
 *           description: The contact number of the worker.
 *         project:
 *           type: string
 *           description: The ID of the associated project.
 *         designation:
 *           type: string
 *           description: The worker's designation or role.
 *         isActive:
 *           type: boolean
 *           description: The active status of the worker.
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the worker was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the worker was last updated.
 *       example:
 *         _id: "63e2b5f3f9a9a17d8c0e76bc"
 *         name: "John Doe"
 *         contactNumber: "1234567890"
 *         project: "63e2b5f3f9a9a17d8c0e76bb"
 *         designation: "Site Engineer"
 *         isActive: true
 *         createdAt: "2025-01-19T10:00:00.000Z"
 *         updatedAt: "2025-01-19T10:30:00.000Z"
 */

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role : {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Worker", workerSchema);
