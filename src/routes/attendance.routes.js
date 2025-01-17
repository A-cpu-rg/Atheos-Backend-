const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAttendance,
  getAttendanceByDate,
  markAttendance,
  updateAttendance,
  verifyAttendance,
  getProjectAttendance,
} = require("../controller/attendance.controller");

router.use(protect); // Protect all routes

// Get attendance records
router.get("/", getAttendance);

// Get attendance by date
router.get("/date/:date", getAttendanceByDate);

// Mark attendance
router.post("/", authorize("siteManager"), markAttendance);

// Update attendance
router.put("/:id", authorize("siteManager"), updateAttendance);

// Verify attendance (client only)
router.put("/:id/verify", authorize("client"), verifyAttendance);

// Get project attendance report
router.get("/project/:projectId", getProjectAttendance);

module.exports = router;
