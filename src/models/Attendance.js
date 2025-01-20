const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - worker
 *         - project
 *         - date
 *         - status
 *       properties:
 *         worker:
 *           type: string
 *           description: Reference to worker ID
 *         project:
 *           type: string
 *           description: Reference to project ID
 *         date:
 *           type: string
 *           format: date
 *           description: Date of attendance
 *         status:
 *           type: string
 *           enum: [present, absent, halfDay]
 *           description: Attendance status
 *         verifiedByClient:
 *           type: boolean
 *           description: Whether attendance has been verified by client
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when attendance was verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the record was last updated
 */
const attendanceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ' <boltAction type="file" filePath="src/models/Attendance.js">Project',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "halfDay"],
      required: true,
    },
    verifiedByClient: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique attendance records per worker per day
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
