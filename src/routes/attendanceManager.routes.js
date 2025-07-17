// const express = require("express")
// const router = express.Router()
// const { protect, authorize } = require("../middleware/auth.js")
// const AttendanceManager = require("../controller/attendanceManager.controller")

// // Check-in route
// router.post(
//   "/checkin",
//   protect,
//   authorize("admin", "siteManager", "topManagement", "housekeeper"),
//   AttendanceManager.performCheckIn,
// )

// // Start break route
// router.post(
//   "/start-break",
//   protect,
//   authorize("admin", "siteManager", "topManagement", "housekeeper"),
//   AttendanceManager.startBreakTime,
// )

// // End break route
// router.post(
//   "/end-break",
//   protect,
//   authorize("admin", "siteManager", "topManagement", "housekeeper"),
//   AttendanceManager.endBreakTime,
// )

// // Check-out route
// router.post(
//   "/checkout",
//   protect,
//   authorize("admin", "siteManager", "topManagement", "housekeeper"),
//   AttendanceManager.performCheckOut,
// )

// // Get today's attendance status
// router.get(
//   "/status",
//   protect,
//   authorize("admin", "siteManager", "topManagement", "housekeeper"),
//   AttendanceManager.getTodayAttendanceStatus,
// )

// module.exports = router



const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/auth.js")
const AttendanceManager = require("../controller/attendanceManager.controller")

// Check-in route
router.post(
  "/checkin",
  protect,
  authorize("admin", "siteManager", "topManagement", "housekeeper","FOE","permanentReliever"),
  AttendanceManager.performCheckIn,
)

// Start break route
router.post(
  "/start-break",
  protect,
  authorize("admin", "siteManager", "topManagement", "housekeeper","FOE","permanentReliever"),
  AttendanceManager.startBreakTime,
)

// End break route
router.post(
  "/end-break",
  protect,
  authorize("admin", "siteManager", "topManagement", "housekeeper","FOE","permanentReliever"),
  AttendanceManager.endBreakTime,
)

// Check-out route
router.post(
  "/checkout",
  protect,
  authorize("admin", "siteManager", "topManagement", "housekeeper","FOE","permanentReliever"),
  AttendanceManager.performCheckOut,
)

// Get today's attendance status
router.get(
  "/status",
  protect,
  authorize("admin", "siteManager", "topManagement", "housekeeper","FOE","permanentReliever"),
  AttendanceManager.getTodayAttendanceStatus,
)

// Get employee attendance history
router.get(
  "/employee-history",
  protect,
  authorize("admin", "siteManager", "topManagement", "housekeeper", "client","FOE","permanentReliever"),
  AttendanceManager.getAttendanceEmployee,
)

module.exports = router
