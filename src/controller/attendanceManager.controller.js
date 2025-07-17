// const Attendance = require("../models/Attendance")
// const Employee = require("../models/Employee")
// const mongoose = require("mongoose")

// class AttendanceManager {
//   // Helper method to calculate duration in minutes
//   calculateTimeDuration(startTime, endTime) {
//     if (!startTime || !endTime) return 0

//     const [startHour, startMinute] = startTime.split(":").map(Number)
//     const [endHour, endMinute] = endTime.split(":").map(Number)

//     const today = new Date()
//     const startDate = new Date(today)
//     const endDate = new Date(today)

//     startDate.setHours(startHour, startMinute, 0, 0)
//     endDate.setHours(endHour, endMinute, 0, 0)

//     if (endDate < startDate) {
//       endDate.setDate(endDate.getDate() + 1)
//     }

//     const diffInMs = endDate - startDate
//     return Math.round(diffInMs / (1000 * 60))
//   }

//   // Check-in API
//   async performCheckIn(req, res) {
//     try {
//       const { employeeId, storeCode } = req.body

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       // Verify employee exists
//       const employee = await Employee.findById(employeeId)
//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found",
//         })
//       }

//       const now = new Date()
//       const checkInTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       // Create date structure
//       const attendanceDate = new Date()
//       attendanceDate.setHours(0, 0, 0, 0)
//       const year = attendanceDate.getFullYear()
//       const month = attendanceDate.getMonth() + 1
//       const day = attendanceDate.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Check if already checked in today
//       const existingRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (existingRecord) {
//         if (existingRecord.checkIn && !existingRecord.checkOut) {
//           return res.status(400).json({
//             success: false,
//             message: "Already checked in today",
//           })
//         }
//         if (existingRecord.checkOut) {
//           return res.status(400).json({
//             success: false,
//             message: "Already completed attendance for today",
//           })
//         }
//       }

//       // Create new attendance record
//       const newRecord = {
//         _id: new mongoose.Types.ObjectId(),
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         worker: new mongoose.Types.ObjectId(employeeId),
//         store: Array.isArray(storeCode) ? storeCode[0] : storeCode,
//         date: {
//           full: attendanceDate,
//           year,
//           month,
//           day,
//         },
//         status: "present",
//         checkIn: checkInTime,
//         checkOut: null,
//         breaks: [],
//         totalBreakTime: 0,
//         totalWorkingTime: 0,
//         remarks: "",
//         verifiedByClient: false,
//         markedBy: req.user?.Name || req.user?.name || "System",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }

//       const insertResult = await attendanceCollection.insertOne(newRecord)

//       if (insertResult.acknowledged) {
//         return res.status(201).json({
//           success: true,
//           message: "Checked in successfully",
//           data: {
//             checkIn: checkInTime,
//             status: "checked_in",
//           },
//         })
//       }

//       throw new Error("Failed to check in")
//     } catch (error) {
//       console.error("Check-in error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Start Break API
//   async startBreakTime(req, res) {
//     try {
//       const { employeeId } = req.body

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       const now = new Date()
//       const breakStartTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Find today's attendance record
//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: "No check-in record found for today",
//         })
//       }

//       if (!attendanceRecord.checkIn) {
//         return res.status(400).json({
//           success: false,
//           message: "Please check in first",
//         })
//       }

//       if (attendanceRecord.checkOut) {
//         return res.status(400).json({
//           success: false,
//           message: "Already checked out for today",
//         })
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Break started",
//         data: {
//           breakStartTime: breakStartTime,
//           status: "on_break",
//         },
//       })
//     } catch (error) {
//       console.error("Start break error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // End Break API
//   async endBreakTime(req, res) {
//     try {
//       const { employeeId, breakStartTime } = req.body

//       if (!employeeId || !breakStartTime) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID and break start time are required",
//         })
//       }

//       const now = new Date()
//       const breakEndTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       // Fix: Use the helper function directly instead of this.calculateTimeDuration
//       const calculateTimeDuration = (startTime, endTime) => {
//         if (!startTime || !endTime) return 0

//         const [startHour, startMinute] = startTime.split(":").map(Number)
//         const [endHour, endMinute] = endTime.split(":").map(Number)

//         const today = new Date()
//         const startDate = new Date(today)
//         const endDate = new Date(today)

//         startDate.setHours(startHour, startMinute, 0, 0)
//         endDate.setHours(endHour, endMinute, 0, 0)

//         if (endDate < startDate) {
//           endDate.setDate(endDate.getDate() + 1)
//         }

//         const diffInMs = endDate - startDate
//         return Math.round(diffInMs / (1000 * 60))
//       }

//       const breakDuration = calculateTimeDuration(breakStartTime, breakEndTime)

//       if (breakDuration <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid break duration",
//         })
//       }

//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Find today's attendance record
//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: "No attendance record found for today",
//         })
//       }

//       const currentBreaks = attendanceRecord.breaks || []
//       const currentTotalBreakTime = attendanceRecord.totalBreakTime || 0

//       // Check if adding this break would exceed 60 minutes
//       if (currentTotalBreakTime + breakDuration > 60) {
//         return res.status(400).json({
//           success: false,
//           message: `Break limit exceeded. You can only take ${60 - currentTotalBreakTime} more minutes today.`,
//         })
//       }

//       // Add new break
//       const newBreak = {
//         startTime: breakStartTime,
//         endTime: breakEndTime,
//         duration: breakDuration,
//       }

//       const updatedBreaks = [...currentBreaks, newBreak]
//       const updatedTotalBreakTime = currentTotalBreakTime + breakDuration

//       // Update attendance record
//       await attendanceCollection.updateOne(
//         { _id: attendanceRecord._id },
//         {
//           $set: {
//             breaks: updatedBreaks,
//             totalBreakTime: updatedTotalBreakTime,
//             updatedAt: new Date(),
//           },
//         },
//       )

//       return res.status(200).json({
//         success: true,
//         message: "Break ended successfully",
//         data: {
//           breakDuration: breakDuration,
//           totalBreakTime: updatedTotalBreakTime,
//           remainingBreakTime: 60 - updatedTotalBreakTime,
//           status: "break_ended",
//           newBreak: newBreak,
//         },
//       })
//     } catch (error) {
//       console.error("End break error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Check-out API
//   async performCheckOut(req, res) {
//     try {
//       const { employeeId } = req.body

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       const now = new Date()
//       const checkOutTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Find today's attendance record
//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: "No check-in record found for today",
//         })
//       }

//       if (!attendanceRecord.checkIn) {
//         return res.status(400).json({
//           success: false,
//           message: "Please check in first",
//         })
//       }

//       if (attendanceRecord.checkOut) {
//         return res.status(400).json({
//           success: false,
//           message: "Already checked out for today",
//         })
//       }

//       // Fix: Use the helper function directly
//       const calculateTimeDuration = (startTime, endTime) => {
//         if (!startTime || !endTime) return 0

//         const [startHour, startMinute] = startTime.split(":").map(Number)
//         const [endHour, endMinute] = endTime.split(":").map(Number)

//         const today = new Date()
//         const startDate = new Date(today)
//         const endDate = new Date(today)

//         startDate.setHours(startHour, startMinute, 0, 0)
//         endDate.setHours(endHour, endMinute, 0, 0)

//         if (endDate < startDate) {
//           endDate.setDate(endDate.getDate() + 1)
//         }

//         const diffInMs = endDate - startDate
//         return Math.round(diffInMs / (1000 * 60))
//       }

//       // Calculate total working time
//       const totalMinutesWorked = calculateTimeDuration(attendanceRecord.checkIn, checkOutTime)
//       const totalBreakTime = attendanceRecord.totalBreakTime || 0
//       const totalWorkingTime = Math.max(0, totalMinutesWorked - totalBreakTime)

//       // Update attendance record
//       await attendanceCollection.updateOne(
//         { _id: attendanceRecord._id },
//         {
//           $set: {
//             checkOut: checkOutTime,
//             totalWorkingTime: totalWorkingTime,
//             updatedAt: new Date(),
//           },
//         },
//       )

//       return res.status(200).json({
//         success: true,
//         message: "Checked out successfully",
//         data: {
//           checkOut: checkOutTime,
//           totalWorkingTime: totalWorkingTime,
//           totalBreakTime: totalBreakTime,
//           status: "checked_out",
//         },
//       })
//     } catch (error) {
//       console.error("Check-out error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Get today's attendance status
//   async getTodayAttendanceStatus(req, res) {
//     try {
//       const { employeeId } = req.query

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       const now = new Date()
//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(200).json({
//           success: true,
//           data: {
//             status: "not_checked_in",
//             checkIn: null,
//             checkOut: null,
//             breaks: [],
//             totalBreakTime: 0,
//             totalWorkingTime: 0,
//           },
//         })
//       }

//       let status = "not_checked_in"
//       if (attendanceRecord.checkIn && !attendanceRecord.checkOut) {
//         status = "checked_in"
//       } else if (attendanceRecord.checkOut) {
//         status = "checked_out"
//       }

//       return res.status(200).json({
//         success: true,
//         data: {
//           status: status,
//           checkIn: attendanceRecord.checkIn,
//           checkOut: attendanceRecord.checkOut,
//           breaks: attendanceRecord.breaks || [],
//           totalBreakTime: attendanceRecord.totalBreakTime || 0,
//           totalWorkingTime: attendanceRecord.totalWorkingTime || 0,
//           remainingBreakTime: 60 - (attendanceRecord.totalBreakTime || 0),
//         },
//       })
//     } catch (error) {
//       console.error("Get attendance status error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }
// }

// module.exports = new AttendanceManager()












// const Attendance = require("../models/Attendance")
// const Employee = require("../models/Employee")
// const mongoose = require("mongoose")

// class AttendanceManager {
//   // Helper method to calculate duration in minutes
//   calculateTimeDuration(startTime, endTime) {
//     if (!startTime || !endTime) return 0

//     const [startHour, startMinute] = startTime.split(":").map(Number)
//     const [endHour, endMinute] = endTime.split(":").map(Number)

//     const today = new Date()
//     const startDate = new Date(today)
//     const endDate = new Date(today)

//     startDate.setHours(startHour, startMinute, 0, 0)
//     endDate.setHours(endHour, endMinute, 0, 0)

//     if (endDate < startDate) {
//       endDate.setDate(endDate.getDate() + 1)
//     }

//     const diffInMs = endDate - startDate
//     return Math.round(diffInMs / (1000 * 60))
//   }

//   // Get all attendance records for an employee
//   async getAttendanceEmployee(req, res) {
//     try {
//       const { employeeId } = req.query
//       const { startDate, endDate, limit = 50, page = 1 } = req.query

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       // Validate employeeId format
//       if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid employee ID format",
//         })
//       }

//       // Verify employee exists
//       const employee = await Employee.findById(employeeId).select("Name EmployeeId Department")
//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found",
//         })
//       }

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Build query
//       const query = {
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//       }

//       // Add date range filter if provided
//       if (startDate || endDate) {
//         const dateFilter = {}

//         if (startDate) {
//           const start = new Date(startDate)
//           if (!isNaN(start.getTime())) {
//             dateFilter.$gte = start
//           }
//         }

//         if (endDate) {
//           const end = new Date(endDate)
//           if (!isNaN(end.getTime())) {
//             // Set to end of day
//             end.setHours(23, 59, 59, 999)
//             dateFilter.$lte = end
//           }
//         }

//         if (Object.keys(dateFilter).length > 0) {
//           query["date.full"] = dateFilter
//         }
//       }

//       console.log("Query for attendance:", JSON.stringify(query))

//       // Calculate pagination
//       const limitNum = Number.parseInt(limit)
//       const pageNum = Number.parseInt(page)
//       const skip = (pageNum - 1) * limitNum

//       // Get total count
//       const totalRecords = await attendanceCollection.countDocuments(query)

//       // Get attendance records with pagination
//       const attendanceRecords = await attendanceCollection
//         .find(query)
//         .sort({ "date.full": -1 }) // Sort by date descending (newest first)
//         .skip(skip)
//         .limit(limitNum)
//         .toArray()

//       console.log(`Found ${attendanceRecords.length} attendance records for employee ${employeeId}`)

//       // Format the response data
//       const formattedRecords = attendanceRecords.map((record) => {
//         // Calculate working hours for display
//         let workingHours = "0:00"
//         if (record.totalWorkingTime && record.totalWorkingTime > 0) {
//           const hours = Math.floor(record.totalWorkingTime / 60)
//           const minutes = record.totalWorkingTime % 60
//           workingHours = `${hours}:${minutes.toString().padStart(2, "0")}`
//         }

//         // Format break time
//         let breakTime = "0:00"
//         if (record.totalBreakTime && record.totalBreakTime > 0) {
//           const hours = Math.floor(record.totalBreakTime / 60)
//           const minutes = record.totalBreakTime % 60
//           breakTime = `${hours}:${minutes.toString().padStart(2, "0")}`
//         }

//         // Format date for display
//         const displayDate = record.date?.full
//           ? new Date(record.date.full).toLocaleDateString("en-GB") // DD/MM/YYYY format
//           : `${record.date?.day}/${record.date?.month}/${record.date?.year}`

//         return {
//           id: record._id,
//           date: displayDate,
//           dateObj: record.date,
//           checkIn: record.checkIn || "--:--",
//           checkOut: record.checkOut || "--:--",
//           status: record.status || "present",
//           workingHours: workingHours,
//           breakTime: breakTime,
//           totalBreaks: record.breaks ? record.breaks.length : 0,
//           breaks: record.breaks || [],
//           remarks: record.remarks || "",
//           verifiedByClient: record.verifiedByClient || false,
//           markedBy: record.markedBy || "",
//           store: record.store || "",
//           createdAt: record.createdAt,
//         }
//       })

//       // Calculate summary statistics
//       const summary = {
//         totalDays: totalRecords,
//         presentDays: formattedRecords.filter((r) => r.status === "present").length,
//         totalWorkingHours: formattedRecords.reduce((sum, record) => {
//           const [hours, minutes] = record.workingHours.split(":").map(Number)
//           return sum + hours * 60 + minutes
//         }, 0),
//         totalBreakTime: formattedRecords.reduce((sum, record) => {
//           const [hours, minutes] = record.breakTime.split(":").map(Number)
//           return sum + hours * 60 + minutes
//         }, 0),
//         averageWorkingHours: 0,
//       }

//       // Calculate average working hours
//       if (summary.presentDays > 0) {
//         const avgMinutes = Math.round(summary.totalWorkingHours / summary.presentDays)
//         const avgHours = Math.floor(avgMinutes / 60)
//         const avgMins = avgMinutes % 60
//         summary.averageWorkingHours = `${avgHours}:${avgMins.toString().padStart(2, "0")}`
//       }

//       // Format total working hours for display
//       const totalHours = Math.floor(summary.totalWorkingHours / 60)
//       const totalMins = summary.totalWorkingHours % 60
//       summary.totalWorkingHoursFormatted = `${totalHours}:${totalMins.toString().padStart(2, "0")}`

//       // Format total break time for display
//       const breakHours = Math.floor(summary.totalBreakTime / 60)
//       const breakMins = summary.totalBreakTime % 60
//       summary.totalBreakTimeFormatted = `${breakHours}:${breakMins.toString().padStart(2, "0")}`

//       return res.status(200).json({
//         success: true,
//         message: "Attendance records retrieved successfully",
//         data: {
//           employee: {
//             id: employee._id,
//             name: employee.Name,
//             employeeId: employee.EmployeeId,
//             department: employee.Department,
//           },
//           attendance: formattedRecords,
//           summary: summary,
//           pagination: {
//             currentPage: pageNum,
//             totalPages: Math.ceil(totalRecords / limitNum),
//             totalRecords: totalRecords,
//             recordsPerPage: limitNum,
//             hasNextPage: pageNum < Math.ceil(totalRecords / limitNum),
//             hasPrevPage: pageNum > 1,
//           },
//         },
//       })
//     } catch (error) {
//       console.error("Error fetching employee attendance:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Check-in API
//   async performCheckIn(req, res) {
//     try {
//       const { employeeId, storeCode } = req.body

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       // Verify employee exists
//       const employee = await Employee.findById(employeeId)
//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found",
//         })
//       }

//       const now = new Date()
//       const checkInTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       // Create date structure
//       const attendanceDate = new Date()
//       attendanceDate.setHours(0, 0, 0, 0)
//       const year = attendanceDate.getFullYear()
//       const month = attendanceDate.getMonth() + 1
//       const day = attendanceDate.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Check if already checked in today
//       const existingRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (existingRecord) {
//         if (existingRecord.checkIn && !existingRecord.checkOut) {
//           return res.status(400).json({
//             success: false,
//             message: "Already checked in today",
//           })
//         }
//         if (existingRecord.checkOut) {
//           return res.status(400).json({
//             success: false,
//             message: "Already completed attendance for today",
//           })
//         }
//       }

//       // Create new attendance record
//       const newRecord = {
//         _id: new mongoose.Types.ObjectId(),
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         worker: new mongoose.Types.ObjectId(employeeId),
//         store: Array.isArray(storeCode) ? storeCode[0] : storeCode,
//         date: {
//           full: attendanceDate,
//           year,
//           month,
//           day,
//         },
//         status: "present",
//         checkIn: checkInTime,
//         checkOut: null,
//         breaks: [],
//         totalBreakTime: 0,
//         totalWorkingTime: 0,
//         remarks: "",
//         verifiedByClient: false,
//         markedBy: req.user?.Name || req.user?.name || "System",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }

//       const insertResult = await attendanceCollection.insertOne(newRecord)

//       if (insertResult.acknowledged) {
//         return res.status(201).json({
//           success: true,
//           message: "Checked in successfully",
//           data: {
//             checkIn: checkInTime,
//             status: "checked_in",
//           },
//         })
//       }

//       throw new Error("Failed to check in")
//     } catch (error) {
//       console.error("Check-in error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Start Break API
//   async startBreakTime(req, res) {
//     try {
//       const { employeeId } = req.body

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       const now = new Date()
//       const breakStartTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Find today's attendance record
//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: "No check-in record found for today",
//         })
//       }

//       if (!attendanceRecord.checkIn) {
//         return res.status(400).json({
//           success: false,
//           message: "Please check in first",
//         })
//       }

//       if (attendanceRecord.checkOut) {
//         return res.status(400).json({
//           success: false,
//           message: "Already checked out for today",
//         })
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Break started",
//         data: {
//           breakStartTime: breakStartTime,
//           status: "on_break",
//         },
//       })
//     } catch (error) {
//       console.error("Start break error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // End Break API
//   async endBreakTime(req, res) {
//     try {
//       const { employeeId, breakStartTime } = req.body

//       if (!employeeId || !breakStartTime) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID and break start time are required",
//         })
//       }

//       const now = new Date()
//       const breakEndTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       // Use the helper function directly instead of this.calculateTimeDuration
//       const breakDuration = this.calculateTimeDuration(breakStartTime, breakEndTime)

//       if (breakDuration <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid break duration",
//         })
//       }

//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Find today's attendance record
//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: "No attendance record found for today",
//         })
//       }

//       const currentBreaks = attendanceRecord.breaks || []
//       const currentTotalBreakTime = attendanceRecord.totalBreakTime || 0

//       // Check if adding this break would exceed 60 minutes
//       if (currentTotalBreakTime + breakDuration > 60) {
//         return res.status(400).json({
//           success: false,
//           message: `Break limit exceeded. You can only take ${60 - currentTotalBreakTime} more minutes today.`,
//         })
//       }

//       // Add new break
//       const newBreak = {
//         startTime: breakStartTime,
//         endTime: breakEndTime,
//         duration: breakDuration,
//       }

//       const updatedBreaks = [...currentBreaks, newBreak]
//       const updatedTotalBreakTime = currentTotalBreakTime + breakDuration

//       // Update attendance record
//       await attendanceCollection.updateOne(
//         { _id: attendanceRecord._id },
//         {
//           $set: {
//             breaks: updatedBreaks,
//             totalBreakTime: updatedTotalBreakTime,
//             updatedAt: new Date(),
//           },
//         },
//       )

//       return res.status(200).json({
//         success: true,
//         message: "Break ended successfully",
//         data: {
//           breakDuration: breakDuration,
//           totalBreakTime: updatedTotalBreakTime,
//           remainingBreakTime: 60 - updatedTotalBreakTime,
//           status: "break_ended",
//           newBreak: newBreak,
//         },
//       })
//     } catch (error) {
//       console.error("End break error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Check-out API
//   async performCheckOut(req, res) {
//     try {
//       const { employeeId } = req.body

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       const now = new Date()
//       const checkOutTime = now.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })

//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       // Find today's attendance record
//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: "No check-in record found for today",
//         })
//       }

//       if (!attendanceRecord.checkIn) {
//         return res.status(400).json({
//           success: false,
//           message: "Please check in first",
//         })
//       }

//       if (attendanceRecord.checkOut) {
//         return res.status(400).json({
//           success: false,
//           message: "Already checked out for today",
//         })
//       }

//       // Use the helper function directly
//       const totalMinutesWorked = this.calculateTimeDuration(attendanceRecord.checkIn, checkOutTime)
//       const totalBreakTime = attendanceRecord.totalBreakTime || 0
//       const totalWorkingTime = Math.max(0, totalMinutesWorked - totalBreakTime)

//       // Update attendance record
//       await attendanceCollection.updateOne(
//         { _id: attendanceRecord._id },
//         {
//           $set: {
//             checkOut: checkOutTime,
//             totalWorkingTime: totalWorkingTime,
//             updatedAt: new Date(),
//           },
//         },
//       )

//       return res.status(200).json({
//         success: true,
//         message: "Checked out successfully",
//         data: {
//           checkOut: checkOutTime,
//           totalWorkingTime: totalWorkingTime,
//           totalBreakTime: totalBreakTime,
//           status: "checked_out",
//         },
//       })
//     } catch (error) {
//       console.error("Check-out error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   // Get today's attendance status
//   async getTodayAttendanceStatus(req, res) {
//     try {
//       const { employeeId } = req.query

//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID is required",
//         })
//       }

//       const now = new Date()
//       const year = now.getFullYear()
//       const month = now.getMonth() + 1
//       const day = now.getDate()

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       const attendanceRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendanceRecord) {
//         return res.status(200).json({
//           success: true,
//           data: {
//             status: "not_checked_in",
//             checkIn: null,
//             checkOut: null,
//             breaks: [],
//             totalBreakTime: 0,
//             totalWorkingTime: 0,
//           },
//         })
//       }

//       let status = "not_checked_in"
//       if (attendanceRecord.checkIn && !attendanceRecord.checkOut) {
//         status = "checked_in"
//       } else if (attendanceRecord.checkOut) {
//         status = "checked_out"
//       }

//       return res.status(200).json({
//         success: true,
//         data: {
//           status: status,
//           checkIn: attendanceRecord.checkIn,
//           checkOut: attendanceRecord.checkOut,
//           breaks: attendanceRecord.breaks || [],
//           totalBreakTime: attendanceRecord.totalBreakTime || 0,
//           totalWorkingTime: attendanceRecord.totalWorkingTime || 0,
//           remainingBreakTime: 60 - (attendanceRecord.totalBreakTime || 0),
//         },
//       })
//     } catch (error) {
//       console.error("Get attendance status error:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }
// }

// module.exports = new AttendanceManager()






const Attendance = require("../models/Attendance")
const Employee = require("../models/Employee")
const mongoose = require("mongoose")

class AttendanceManager {
  // Helper method to calculate duration in minutes
  calculateTimeDuration = (startTime, endTime) => {
    // Changed to arrow function
    if (!startTime || !endTime) return 0

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const today = new Date()
    const startDate = new Date(today)
    const endDate = new Date(today)

    startDate.setHours(startHour, startMinute, 0, 0)
    endDate.setHours(endHour, endMinute, 0, 0)

    // Handle case where end time is next day (past midnight)
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1)
    }

    const diffInMs = endDate - startDate
    return Math.round(diffInMs / (1000 * 60))
  }

  // Get all attendance records for an employee
  getAttendanceEmployee = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId } = req.query
      const { startDate, endDate, limit = 50, page = 1 } = req.query

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      // Validate employeeId format
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID format",
        })
      }

      // Verify employee exists
      const employee = await Employee.findById(employeeId).select("Name EmployeeId Department")
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        })
      }

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      // Build query
      const query = {
        employeeId: new mongoose.Types.ObjectId(employeeId),
      }

      // Add date range filter if provided
      if (startDate || endDate) {
        const dateFilter = {}

        if (startDate) {
          const start = new Date(startDate)
          if (!isNaN(start.getTime())) {
            dateFilter.$gte = start
          }
        }

        if (endDate) {
          const end = new Date(endDate)
          if (!isNaN(end.getTime())) {
            // Set to end of day
            end.setHours(23, 59, 59, 999)
            dateFilter.$lte = end
          }
        }

        if (Object.keys(dateFilter).length > 0) {
          query["date.full"] = dateFilter
        }
      }

      console.log("Query for attendance:", JSON.stringify(query))

      // Calculate pagination
      const limitNum = Number.parseInt(limit)
      const pageNum = Number.parseInt(page)
      const skip = (pageNum - 1) * limitNum

      // Get total count
      const totalRecords = await attendanceCollection.countDocuments(query)

      // Get attendance records with pagination
      const attendanceRecords = await attendanceCollection
        .find(query)
        .sort({ "date.full": -1 }) // Sort by date descending (newest first)
        .skip(skip)
        .limit(limitNum)
        .toArray()

      console.log(`Found ${attendanceRecords.length} attendance records for employee ${employeeId}`)

      // Format the response data
      const formattedRecords = attendanceRecords.map((record) => {
        // Calculate working hours for display
        let workingHours = "0:00"
        if (record.totalWorkingTime && record.totalWorkingTime > 0) {
          const hours = Math.floor(record.totalWorkingTime / 60)
          const minutes = record.totalWorkingTime % 60
          workingHours = `${hours}:${minutes.toString().padStart(2, "0")}`
        }

        // Format break time
        let breakTime = "0:00"
        if (record.totalBreakTime && record.totalBreakTime > 0) {
          const hours = Math.floor(record.totalBreakTime / 60)
          const minutes = record.totalBreakTime % 60
          breakTime = `${hours}:${minutes.toString().padStart(2, "0")}`
        }

        // Format date for display
        const displayDate = record.date?.full
          ? new Date(record.date.full).toLocaleDateString("en-GB") // DD/MM/YYYY format
          : `${record.date?.day}/${record.date?.month}/${record.date?.year}`

        return {
          id: record._id,
          date: displayDate,
          dateObj: record.date,
          checkIn: record.checkIn || "--:--",
          checkOut: record.checkOut || "--:--",
          status: record.status || "present",
          workingHours: workingHours,
          breakTime: breakTime,
          totalBreaks: record.breaks ? record.breaks.length : 0,
          breaks: record.breaks || [],
          remarks: record.remarks || "",
          verifiedByClient: record.verifiedByClient || false,
          markedBy: record.markedBy || "",
          store: record.store || "",
          createdAt: record.createdAt,
        }
      })

      // Calculate summary statistics
      const summary = {
        totalDays: totalRecords,
        presentDays: formattedRecords.filter((r) => r.status === "present").length,
        totalWorkingHours: formattedRecords.reduce((sum, record) => {
          const [hours, minutes] = record.workingHours.split(":").map(Number)
          return sum + hours * 60 + minutes
        }, 0),
        totalBreakTime: formattedRecords.reduce((sum, record) => {
          const [hours, minutes] = record.breakTime.split(":").map(Number)
          return sum + hours * 60 + minutes
        }, 0),
        averageWorkingHours: 0,
      }

      // Calculate average working hours
      if (summary.presentDays > 0) {
        const avgMinutes = Math.round(summary.totalWorkingHours / summary.presentDays)
        const avgHours = Math.floor(avgMinutes / 60)
        const avgMins = avgMinutes % 60
        summary.averageWorkingHours = `${avgHours}:${avgMins.toString().padStart(2, "0")}`
      }

      // Format total working hours for display
      const totalHours = Math.floor(summary.totalWorkingHours / 60)
      const totalMins = summary.totalWorkingHours % 60
      summary.totalWorkingHoursFormatted = `${totalHours}:${totalMins.toString().padStart(2, "0")}`

      // Format total break time for display
      const breakHours = Math.floor(summary.totalBreakTime / 60)
      const breakMins = summary.totalBreakTime % 60
      summary.totalBreakTimeFormatted = `${breakHours}:${breakMins.toString().padStart(2, "0")}`

      return res.status(200).json({
        success: true,
        message: "Attendance records retrieved successfully",
        data: {
          employee: {
            id: employee._id,
            name: employee.Name,
            employeeId: employee.EmployeeId,
            department: employee.Department,
          },
          attendance: formattedRecords,
          summary: summary,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalRecords / limitNum),
            totalRecords: totalRecords,
            recordsPerPage: limitNum,
            hasNextPage: pageNum < Math.ceil(totalRecords / limitNum),
            hasPrevPage: pageNum > 1,
          },
        },
      })
    } catch (error) {
      console.error("Error fetching employee attendance:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Check-in API
  performCheckIn = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId, storeCode } = req.body

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      // Verify employee exists
      const employee = await Employee.findById(employeeId)
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        })
      }

      const now = new Date()
      const checkInTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      // Create date structure
      const attendanceDate = new Date()
      attendanceDate.setHours(0, 0, 0, 0)
      const year = attendanceDate.getFullYear()
      const month = attendanceDate.getMonth() + 1
      const day = attendanceDate.getDate()

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      // Check if already checked in today
      const existingRecord = await attendanceCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (existingRecord) {
        if (existingRecord.checkIn && !existingRecord.checkOut) {
          return res.status(400).json({
            success: false,
            message: "Already checked in today",
          })
        }
        if (existingRecord.checkOut) {
          return res.status(400).json({
            success: false,
            message: "Already completed attendance for today",
          })
        }
      }

      // Create new attendance record
      const newRecord = {
        _id: new mongoose.Types.ObjectId(),
        employeeId: new mongoose.Types.ObjectId(employeeId),
        worker: new mongoose.Types.ObjectId(employeeId),
        store: Array.isArray(storeCode) ? storeCode[0] : storeCode,
        date: {
          full: attendanceDate,
          year,
          month,
          day,
        },
        status: "present",
        checkIn: checkInTime,
        checkOut: null,
        breaks: [],
        totalBreakTime: 0,
        totalWorkingTime: 0,
        remarks: "",
        verifiedByClient: false,
        markedBy: req.user?.Name || req.user?.name || "System",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const insertResult = await attendanceCollection.insertOne(newRecord)

      if (insertResult.acknowledged) {
        return res.status(201).json({
          success: true,
          message: "Checked in successfully",
          data: {
            checkIn: checkInTime,
            status: "checked_in",
          },
        })
      }

      throw new Error("Failed to check in")
    } catch (error) {
      console.error("Check-in error:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Start Break API
  startBreakTime = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId } = req.body

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      const now = new Date()
      const breakStartTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      // Find today's attendance record
      const attendanceRecord = await attendanceCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (!attendanceRecord) {
        return res.status(404).json({
          success: false,
          message: "No check-in record found for today",
        })
      }

      if (!attendanceRecord.checkIn) {
        return res.status(400).json({
          success: false,
          message: "Please check in first",
        })
      }

      if (attendanceRecord.checkOut) {
        return res.status(400).json({
          success: false,
          message: "Already checked out for today",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Break started",
        data: {
          breakStartTime: breakStartTime,
          status: "on_break",
        },
      })
    } catch (error) {
      console.error("Start break error:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // End Break API
  endBreakTime = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId, breakStartTime } = req.body

      if (!employeeId || !breakStartTime) {
        return res.status(400).json({
          success: false,
          message: "Employee ID and break start time are required",
        })
      }

      const now = new Date()
      const breakEndTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      // Use the class method directly
      const breakDuration = this.calculateTimeDuration(breakStartTime, breakEndTime)

      if (breakDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid break duration",
        })
      }

      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      // Find today's attendance record
      const attendanceRecord = await attendanceCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (!attendanceRecord) {
        return res.status(404).json({
          success: false,
          message: "No attendance record found for today",
        })
      }

      const currentBreaks = attendanceRecord.breaks || []
      const currentTotalBreakTime = attendanceRecord.totalBreakTime || 0

      // Check if adding this break would exceed 60 minutes
      if (currentTotalBreakTime + breakDuration > 60) {
        return res.status(400).json({
          success: false,
          message: `Break limit exceeded. You can only take ${60 - currentTotalBreakTime} more minutes today.`,
        })
      }

      // Add new break
      const newBreak = {
        startTime: breakStartTime,
        endTime: breakEndTime,
        duration: breakDuration,
      }

      const updatedBreaks = [...currentBreaks, newBreak]
      const updatedTotalBreakTime = currentTotalBreakTime + breakDuration

      // Update attendance record
      await attendanceCollection.updateOne(
        { _id: attendanceRecord._id },
        {
          $set: {
            breaks: updatedBreaks,
            totalBreakTime: updatedTotalBreakTime,
            updatedAt: new Date(),
          },
        },
      )

      return res.status(200).json({
        success: true,
        message: "Break ended successfully",
        data: {
          breakDuration: breakDuration,
          totalBreakTime: updatedTotalBreakTime,
          remainingBreakTime: 60 - updatedTotalBreakTime,
          status: "break_ended",
          newBreak: newBreak,
        },
      })
    } catch (error) {
      console.error("End break error:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Check-out API
  performCheckOut = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId } = req.body

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      const now = new Date()
      const checkOutTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      // Find today's attendance record
      const attendanceRecord = await attendanceCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (!attendanceRecord) {
        return res.status(404).json({
          success: false,
          message: "No check-in record found for today",
        })
      }

      if (!attendanceRecord.checkIn) {
        return res.status(400).json({
          success: false,
          message: "Please check in first",
        })
      }

      if (attendanceRecord.checkOut) {
        return res.status(400).json({
          success: false,
          message: "Already checked out for today",
        })
      }

      // Use the class method directly
      const totalMinutesWorked = this.calculateTimeDuration(attendanceRecord.checkIn, checkOutTime)
      const totalBreakTime = attendanceRecord.totalBreakTime || 0
      const totalWorkingTime = Math.max(0, totalMinutesWorked - totalBreakTime)

      // Update attendance record
      await attendanceCollection.updateOne(
        { _id: attendanceRecord._id },
        {
          $set: {
            checkOut: checkOutTime,
            totalWorkingTime: totalWorkingTime,
            updatedAt: new Date(),
          },
        },
      )

      return res.status(200).json({
        success: true,
        message: "Checked out successfully",
        data: {
          checkOut: checkOutTime,
          totalWorkingTime: totalWorkingTime,
          totalBreakTime: totalBreakTime,
          status: "checked_out",
        },
      })
    } catch (error) {
      console.error("Check-out error:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Get today's attendance status
  getTodayAttendanceStatus = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId } = req.query

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      const attendanceRecord = await attendanceCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (!attendanceRecord) {
        return res.status(200).json({
          success: true,
          data: {
            status: "not_checked_in",
            checkIn: null,
            checkOut: null,
            breaks: [],
            totalBreakTime: 0,
            totalWorkingTime: 0,
          },
        })
      }

      let status = "not_checked_in"
      if (attendanceRecord.checkIn && !attendanceRecord.checkOut) {
        status = "checked_in"
      } else if (attendanceRecord.checkOut) {
        status = "checked_out"
      }

      return res.status(200).json({
        success: true,
        data: {
          status: status,
          checkIn: attendanceRecord.checkIn,
          checkOut: attendanceRecord.checkOut,
          breaks: attendanceRecord.breaks || [],
          totalBreakTime: attendanceRecord.totalBreakTime || 0,
          totalWorkingTime: attendanceRecord.totalWorkingTime || 0,
          remainingBreakTime: 60 - (attendanceRecord.totalBreakTime || 0),
        },
      })
    } catch (error) {
      console.error("Get attendance status error:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
}

module.exports = new AttendanceManager()
