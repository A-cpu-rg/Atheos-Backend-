const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.js");
const {
  getAttendance,
  getAttendanceByDate,
  markAttendance,
  updateAttendance,
  verifyAttendance,
  getProjectAttendance,
} = require("../controller/attendance.controller");

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/", protect, getAttendance);

/**
 * @swagger
 * /api/attendance/date/{date}:
 *   get:
 *     summary: Get attendance records by date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Attendance records for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/date/:date", protect, getAttendanceByDate);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Mark attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - worker
 *               - project
 *               - date
 *               - status
 *             properties:
 *               worker:
 *                 type: string
 *                 description: Worker ID
 *               project:
 *                 type: string
 *                 description: Project ID
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [present, absent, halfDay]
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       403:
 *         description: Not authorized to mark attendance
 *       500:
 *         description: Server error
 */
router.post("/", protect, authorize("siteManager"), markAttendance);

/**
 * @swagger
 * /api/attendance/{id}/verify:
 *   put:
 *     summary: Verify attendance (client only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance verified successfully
 *       403:
 *         description: Not authorized to verify attendance
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.put("/:id/verify", protect, authorize("client"), verifyAttendance);

/**
 * @swagger
 * /api/attendance/project/{projectId}:
 *   get:
 *     summary: Get project attendance report
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project attendance report
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/project/:projectId", protect, getProjectAttendance);

module.exports = router;
