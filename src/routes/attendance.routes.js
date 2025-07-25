const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.js");
const AttendanceController = require("../controller/attendance.controller");

// Base routes with appropriate authorization
router.get("/", protect, authorize("admin", "siteManager", "assistantManager","client","topManagement","middleManagement","housekeeper"), AttendanceController.getAttendance);

// Both authenticated and public endpoints for date-based attendance
router.get("/date/:date", protect, authorize("admin", "siteManager", "assistantManager","client","topManagement","middleManagement","housekeeper"), AttendanceController.getAttendanceByDate);
router.get("/public/date/:date", AttendanceController.getAttendanceByDate);
// GET /api/attendance/by-date?employeeId=...&date=YYYY-MM-DD
router.get('/by-date', AttendanceController.getAttendanceByDate);

// Mark attendance - accessible by site managers and above
router.post("/",
    protect,
    authorize("admin", "siteManager", "topManagement", "housekeeper","permanentReliever"),
    AttendanceController.markAttendance
);

router.post("/post",
    protect,
    authorize("admin", "siteManager", "topManagement", "housekeeper","permanentReliever"),
    AttendanceController.createOrUpdateAttendance
);

// Update attendance - add this route for admin and top management
router.put("/:id", protect, authorize("admin", "topManagement", "siteManager","middleManagement","permanentReliever"), AttendanceController.updateAttendance);

// Get attendance statistics - for admins and managers
router.get("/stats", protect, authorize("admin", "siteManager", "topManagement","middleManagement","permanentReliever"), AttendanceController.getAttendanceStats);

// Store specific route - for store managers and admins
router.get("/store/:storeId", protect, authorize("admin", "siteManager","middleManagement","permanentReliever"), AttendanceController.getStoreAttendance);

// Verification route - only clients can verify attendance
router.put("/:id/verify", protect, authorize("client"), AttendanceController.verifyAttendance);

module.exports = router;