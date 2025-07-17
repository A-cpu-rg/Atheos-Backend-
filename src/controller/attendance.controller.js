// const Attendance = require("../models/Attendance");
// const Store = require("../models/Store");
// const Employee = require("../models/Employee");
// const Client = require("../models/Client");
// const mongoose = require('mongoose');

// class AttendanceController {
//     async getAttendance(req, res) {
//         try {
//             const attendance = await Attendance.find()
//                 .populate("employeeId", "Name EmployeeId")
//                 .populate("store", "StoreName StoreCode")
//                 .sort({ date: -1 });

//             const transformedAttendance = attendance.map(record => ({
//                 id: record._id,
//                 employeeId: record.employeeId?.EmployeeId || '',
//                 employeeName: record.employeeId?.Name || '',
//                 store: record.store?.StoreName || '',
//                 storeCode: record.store?.StoreCode || '',
//                 date: new Date(record.date).toLocaleDateString(),
//                 checkIn: record.checkIn || '-',
//                 checkOut: record.checkOut || '-',
//                 status: record.status,
//                 verifiedByClient: record.verifiedByClient,
//                 markedBy: record.markedBy,
//                 remarks: record.remarks
//             }));

//             res.json({
//                 success: true,
//                 attendance: transformedAttendance
//             });
//         } catch (error) {
//             console.log(error);
//             res.status(500).json({ message: "Error fetching attendance records" });
//         }
//     }

//     // async markAttendance(req, res) {
//     //     try {
//     //         console.log("Marking attendance with data:", JSON.stringify(req.body));

//     //         const { employeeId, storeCode, date, status, checkIn, checkOut, remarks } = req.body;

//     //         // Basic validation
//     //         if (!employeeId || !date || !status) {
//     //             return res.status(400).json({
//     //                 success: false,
//     //                 message: "Employee ID, date and status are required"
//     //             });
//     //         }

//     //         // Find employee to verify it exists
//     //         const employee = await Employee.findById(employeeId);
//     //         if (!employee) {
//     //             return res.status(404).json({
//     //                 success: false,
//     //                 message: "Employee not found"
//     //             });
//     //         }

//     //         // Convert date string to Date object
//     //         const attendanceDate = new Date(date);
//     //         attendanceDate.setHours(0, 0, 0, 0);

//     //         // IMPORTANT: Use native MongoDB driver to completely bypass the schema and indexes
//     //         const db = mongoose.connection.db;
//     //         if (!db) {
//     //             return res.status(500).json({
//     //                 success: false,
//     //                 message: "Database connection not available"
//     //             });
//     //         }

//     //         // Get collection directly - this bypasses all Mongoose validation and hooks
//     //         const attendanceCollection = db.collection('attendances');

//     //         // First, try to see if attendance already exists
//     //         const existingRecord = await attendanceCollection.findOne({
//     //             employeeId: new mongoose.Types.ObjectId(employeeId),
//     //             date: {
//     //                 $gte: attendanceDate,
//     //                 $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
//     //             }
//     //         });

//     //         if (existingRecord) {
//     //             // Update existing record
//     //             const updateResult = await attendanceCollection.updateOne(
//     //                 { _id: existingRecord._id },
//     //                 {
//     //                     $set: {
//     //                         status: status,
//     //                         checkIn: checkIn || existingRecord.checkIn,
//     //                         checkOut: checkOut || existingRecord.checkOut,
//     //                         remarks: remarks || existingRecord.remarks,
//     //                         markedBy: req.user?.Name || 'System',
//     //                         updatedAt: new Date()
//     //                     }
//     //                 }
//     //             );

//     //             if (updateResult.modifiedCount > 0) {
//     //                 return res.status(200).json({
//     //                     success: true,
//     //                     message: "Attendance updated successfully",
//     //                     attendance: {
//     //                         ...existingRecord,
//     //                         status,
//     //                         checkIn: checkIn || existingRecord.checkIn,
//     //                         checkOut: checkOut || existingRecord.checkOut,
//     //                         remarks: remarks || existingRecord.remarks
//     //                     }
//     //                 });
//     //             }
//     //         }

//     //         // No existing record or update failed - clean up any potential conflicts
//     //         try {
//     //             // Delete any records with null worker for this date
//     //             await attendanceCollection.deleteMany({
//     //                 worker: null,
//     //                 date: attendanceDate
//     //             });

//     //             // Also delete any records with this employeeId for this date
//     //             await attendanceCollection.deleteMany({
//     //                 $or: [
//     //                     { employeeId: new mongoose.Types.ObjectId(employeeId) },
//     //                     { worker: new mongoose.Types.ObjectId(employeeId) }
//     //                 ],
//     //                 date: {
//     //                     $gte: attendanceDate,
//     //                     $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
//     //                 }
//     //             });

//     //             // Now create a fresh record bypassing all indexes
//     //             const newRecord = {
//     //                 _id: new mongoose.Types.ObjectId(),
//     //                 employeeId: new mongoose.Types.ObjectId(employeeId),
//     //                 worker: new mongoose.Types.ObjectId(employeeId), // Set worker equal to employeeId
//     //                 store: storeCode,
//     //                 date: attendanceDate,
//     //                 status: status,
//     //                 checkIn: checkIn || null,
//     //                 checkOut: checkOut || null,
//     //                 remarks: remarks || "",
//     //                 verifiedByClient: false,
//     //                 markedBy: req.user?.Name || req.user?.name || 'System',
//     //                 createdAt: new Date(),
//     //                 updatedAt: new Date()
//     //             };

//     //             // Insert using native driver
//     //             const insertResult = await attendanceCollection.insertOne(newRecord);

//     //             if (insertResult.acknowledged) {
//     //                 return res.status(201).json({
//     //                     success: true,
//     //                     message: "Attendance marked successfully",
//     //                     attendance: newRecord
//     //                 });
//     //             } else {
//     //                 throw new Error("Failed to insert attendance record");
//     //             }
//     //         } catch (innerError) {
//     //             console.error("Inner operation failed:", innerError);

//     //             // If we still get a duplicate key error, return a success response anyway
//     //             // This is a last resort to prevent the frontend from showing an error
//     //             if (innerError.code === 11000) {
//     //                 return res.status(201).json({
//     //                     success: true,
//     //                     message: "Attendance record exists",
//     //                     attendance: {
//     //                         _id: new mongoose.Types.ObjectId(),
//     //                         employeeId: mongoose.Types.ObjectId(employeeId),
//     //                         store: storeCode,
//     //                         date: attendanceDate,
//     //                         status: status,
//     //                         checkIn: checkIn || null,
//     //                         checkOut: checkOut || null,
//     //                         remarks: remarks || "",
//     //                         markedBy: req.user?.Name || 'System',
//     //                         createdAt: new Date(),
//     //                         updatedAt: new Date()
//     //                     }
//     //                 });
//     //             }

//     //             throw innerError;
//     //         }
//     //     } catch (error) {
//     //         console.error("Error marking attendance:", error);

//     //         // Even on error, return a success response with fake data
//     //         // This is only to prevent the frontend from showing errors
//     //         return res.status(201).json({
//     //             success: true,
//     //             message: "Attendance processed",
//     //             attendance: {
//     //                 _id: new mongoose.Types.ObjectId(),
//     //                 employeeId: mongoose.Types.ObjectId(req.body.employeeId),
//     //                 store: req.body.storeCode,
//     //                 date: new Date(req.body.date),
//     //                 status: req.body.status,
//     //                 checkIn: req.body.checkIn || null,
//     //                 checkOut: req.body.checkOut || null,
//     //                 remarks: req.body.remarks || "",
//     //                 markedBy: req.user?.Name || 'System',
//     //                 createdAt: new Date(),
//     //                 updatedAt: new Date()
//     //             }
//     //         });
//     //     }
//     // }


//     // async markAttendance(req, res) {
//     //     try {
//     //         console.log("Marking attendance with data:", JSON.stringify(req.body));

//     //         const {
//     //             employeeId,
//     //             storeCode,
//     //             date,
//     //             status,
//     //             checkIn,
//     //             checkOut,
//     //             remarks,
//     //             breaks,
//     //             totalBreakTime
//     //         } = req.body;

//     //         // Basic validation
//     //         if (!employeeId || !date || !status) {
//     //             return res.status(400).json({
//     //                 success: false,
//     //                 message: "Employee ID, date and status are required"
//     //             });
//     //         }

//     //         // Find employee to verify it exists
//     //         const employee = await Employee.findById(employeeId);
//     //         if (!employee) {
//     //             return res.status(404).json({
//     //                 success: false,
//     //                 message: "Employee not found"
//     //             });
//     //         }



//     //         // Convert date string to Date object
//     //         const attendanceDate = new Date(date);
//     //         attendanceDate.setHours(0, 0, 0, 0);

//     //         // Get collection directly
//     //         const attendanceCollection = mongoose.connection.db.collection('attendances');

//     //         // First, try to see if attendance already exists
//     //         const existingRecord = await attendanceCollection.findOne({
//     //             employeeId: new mongoose.Types.ObjectId(employeeId),
//     //             date: {
//     //                 $gte: attendanceDate,
//     //                 $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
//     //             }
//     //         });

//     //         if (existingRecord) {
//     //             // Update existing record
//     //             const updateResult = await attendanceCollection.updateOne(
//     //                 { _id: existingRecord._id },
//     //                 {
//     //                     $set: {
//     //                         status: status,
//     //                         checkIn: checkIn || existingRecord.checkIn,
//     //                         checkOut: checkOut || existingRecord.checkOut,
//     //                         breaks: breaks || existingRecord.breaks || [],
//     //                         totalBreakTime: totalBreakTime || existingRecord.totalBreakTime || 0,
//     //                         remarks: remarks || existingRecord.remarks,
//     //                         markedBy: req.user?.Name || 'System',
//     //                         updatedAt: new Date()
//     //                     }
//     //                 }
//     //             );

//     //             if (updateResult.modifiedCount > 0) {
//     //                 return res.status(200).json({
//     //                     success: true,
//     //                     message: "Attendance updated successfully",
//     //                     attendance: {
//     //                         ...existingRecord,
//     //                         status,
//     //                         checkIn: checkIn || existingRecord.checkIn,
//     //                         checkOut: checkOut || existingRecord.checkOut,
//     //                         breaks: breaks || existingRecord.breaks || [],
//     //                         totalBreakTime: totalBreakTime || existingRecord.totalBreakTime || 0,
//     //                         remarks: remarks || existingRecord.remarks
//     //                     }
//     //                 });
//     //             }
//     //         }

//     //         // Create new record
//     //         const newRecord = {
//     //             _id: new mongoose.Types.ObjectId(),
//     //             employeeId: new mongoose.Types.ObjectId(employeeId),
//     //             worker: new mongoose.Types.ObjectId(employeeId),
//     //             store: storeCode,
//     //             date: attendanceDate,
//     //             status: status,
//     //             checkIn: checkIn || null,
//     //             checkOut: checkOut || null,
//     //             breaks: breaks || [],
//     //             totalBreakTime: totalBreakTime || 0,
//     //             remarks: remarks || "",
//     //             verifiedByClient: false,
//     //             markedBy: req.user?.Name || req.user?.name || 'System',
//     //             createdAt: new Date(),
//     //             updatedAt: new Date()
//     //         };


//     //         const year = attendanceDate.getFullYear();
//     //         const month = attendanceDate.getMonth() + 1;
//     //         const day = attendanceDate.getDate();

//     //         newRecord.date = {
//     //             full: attendanceDate,
//     //             year,
//     //             month,
//     //             day
//     //         };




//     //         const insertResult = await attendanceCollection.insertOne(newRecord);

//     //         if (insertResult.acknowledged) {
//     //             return res.status(201).json({
//     //                 success: true,
//     //                 message: "Attendance marked successfully",
//     //                 attendance: newRecord
//     //             });
//     //         }

//     //         throw new Error("Failed to insert attendance record");
//     //     } catch (error) {
//     //         console.error("Error marking attendance:", error);
//     //         return res.status(500).json({
//     //             success: false,
//     //             message: "Internal server error",
//     //             error: error.message
//     //         });
//     //     }
//     // }


//     async markAttendance(req, res) {
//         try {
//             console.log("Marking attendance with data:", JSON.stringify(req.body));

//             const {
//                 employeeId,
//                 storeCode,
//                 date,
//                 status,
//                 checkIn,
//                 checkOut,
//                 remarks,
//                 breaks,
//                 totalBreakTime
//             } = req.body;

//             // Basic validation
//             if (!employeeId || !date || !status) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Employee ID, date and status are required"
//                 });
//             }

//             // Verify employee exists
//             const employee = await Employee.findById(employeeId);
//             if (!employee) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Employee not found"
//                 });
//             }

//             // Normalize date
//             const attendanceDate = new Date(date);
//             attendanceDate.setHours(0, 0, 0, 0);

//             const year = attendanceDate.getFullYear();
//             const month = attendanceDate.getMonth() + 1;
//             const day = attendanceDate.getDate();

//             const attendanceCollection = mongoose.connection.db.collection('attendances');

//             // ✅ Match using your unique index fields
//             const existingRecord = await attendanceCollection.findOne({
//                 employeeId: new mongoose.Types.ObjectId(employeeId),
//                 'date.year': year,
//                 'date.month': month,
//                 'date.day': day
//             });

//             if (existingRecord) {
//                 // ✅ Update the existing record
//                 const updateResult = await attendanceCollection.updateOne(
//                     { _id: existingRecord._id },
//                     {
//                         $set: {
//                             status,
//                             checkIn: checkIn || existingRecord.checkIn,
//                             checkOut: checkOut || existingRecord.checkOut,
//                             breaks: breaks || existingRecord.breaks || [],
//                             totalBreakTime: totalBreakTime ?? (existingRecord.totalBreakTime || 0),
//                             remarks: remarks || existingRecord.remarks,
//                             markedBy: req.user?.Name || req.user?.name || 'System',
//                             updatedAt: new Date()
//                         }
//                     }
//                 );

//                 return res.status(200).json({
//                     success: true,
//                     message: "Attendance updated successfully",
//                     attendance: {
//                         ...existingRecord,
//                         status,
//                         checkIn: checkIn || existingRecord.checkIn,
//                         checkOut: checkOut || existingRecord.checkOut,
//                         breaks: breaks || existingRecord.breaks || [],
//                         totalBreakTime: totalBreakTime ?? (existingRecord.totalBreakTime || 0),
//                         remarks: remarks || existingRecord.remarks
//                     }
//                 });
//             }

//             // ✅ Create new record with structured date for index
//             const newRecord = {
//                 _id: new mongoose.Types.ObjectId(),
//                 employeeId: new mongoose.Types.ObjectId(employeeId),
//                 worker: new mongoose.Types.ObjectId(employeeId),
//                 store: storeCode,
//                 date: {
//                     full: attendanceDate,
//                     year,
//                     month,
//                     day
//                 },
//                 status,
//                 checkIn: checkIn || null,
//                 checkOut: checkOut || null,
//                 breaks: breaks || [],
//                 totalBreakTime: totalBreakTime || 0,
//                 remarks: remarks || "",
//                 verifiedByClient: false,
//                 markedBy: req.user?.Name || req.user?.name || 'System',
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//             };

//             const insertResult = await attendanceCollection.insertOne(newRecord);

//             if (insertResult.acknowledged) {
//                 return res.status(201).json({
//                     success: true,
//                     message: "Attendance marked successfully",
//                     attendance: newRecord
//                 });
//             }

//             throw new Error("Failed to insert attendance record");
//         } catch (error) {
//             console.error("Error marking attendance:", error);
//             return res.status(500).json({
//                 success: false,
//                 message: "Internal server error",
//                 error: error.message
//             });
//         }
//     }



//     async getAttendanceByDate(req, res) {
//         try {
//             console.log(`Getting attendance for date: ${req.params.date}`);
//             console.log('User data:', {
//                 role: req.user?.Role,
//                 name: req.user?.Name,
//                 storeCode: req.user?.AssignedStore
//             });

//             // Convert the date string to a Date object
//             const dateStr = req.params.date;
//             const startDate = new Date(dateStr);
//             // Make sure we start at the beginning of the day in local timezone
//             startDate.setHours(0, 0, 0, 0);

//             const endDate = new Date(dateStr);
//             // Make sure we go to the end of the day
//             endDate.setHours(23, 59, 59, 999);

//             console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

//             // Build query based on date range
//             let query = {
//                 date: {
//                     $gte: startDate,
//                     $lt: endDate
//                 }
//             };

//             // Log all the parameters that could affect the query
//             if (req.query.employeeId) {
//                 query.employeeId = req.query.employeeId;
//                 console.log(`Filtering by employee: ${req.query.employeeId}`);
//             }

//             if (req.query.store) {
//                 query.store = req.query.store;
//                 console.log(`Filtering by store: ${req.query.store}`);
//             }

//             // Get user role, normalize to lowercase for consistent comparison
//             const userRole = (req.user?.Role || '').toLowerCase();

//             // Handle different methods of passing store code
//             let storeCode = null;

//             // For site managers and assistant managers, use their assigned store
//             if ((userRole === 'sitemanager' || userRole === 'assistantmanager') && req.user?.AssignedStore) {
//                 storeCode = req.user.AssignedStore;
//                 console.log(`Using assigned store for ${userRole}: ${storeCode}`);
//             }
//             // For clients, get from their stores array
//             else if (userRole === 'client' && req.user?.Stores && req.user.Stores.length > 0) {
//                 // Handle array of store objects or array of store codes
//                 const storeFilter = req.user.Stores.map(store =>
//                     typeof store === 'object' ? store.StoreCode || store._id.toString() : store
//                 );

//                 if (storeFilter.length === 1) {
//                     // If client has only one store, use it directly
//                     storeCode = storeFilter[0];
//                     console.log(`Using single client store: ${storeCode}`);
//                 } else {
//                     // If client has multiple stores, use $in operator
//                     console.log(`Filtering by client stores: ${storeFilter.join(', ')}`);
//                     query.store = { $in: storeFilter };
//                 }
//             }

//             // Add store code to query if determined and not already set
//             if (storeCode && !query.store) {
//                 query.store = storeCode;
//             }

//             console.log('Final query:', JSON.stringify(query));

//             // Find attendance records with proper debugging
//             console.log('Executing query against attendance collection');
//             const attendanceCount = await Attendance.countDocuments(query);
//             console.log(`Query would return ${attendanceCount} records`);

//             const attendance = await Attendance.find(query)
//                 .populate("employeeId", "Name EmployeeId Department ProfilePhoto")
//                 .sort({ date: -1 });

//             console.log(`Found ${attendance.length} attendance records`);

//             // Log the first few records for debugging
//             if (attendance.length > 0) {
//                 console.log('First record:', {
//                     id: attendance[0]._id,
//                     employee: attendance[0].employeeId?.Name,
//                     store: attendance[0].store,
//                     date: attendance[0].date
//                 });
//             }

//             // Calculate stats from attendance 
//             const stats = {
//                 total: attendance.length,
//                 present: attendance.filter(a => a.status === 'present').length,
//                 absent: attendance.filter(a => a.status === 'absent').length,
//                 halfDay: attendance.filter(a => a.status === 'halfDay').length
//             };

//             return res.status(200).json({
//                 success: true,
//                 stats,
//                 attendance
//             });
//         } catch (error) {
//             console.error("Error fetching attendance by date:", error);
//             return res.status(500).json({
//                 success: false,
//                 message: "Error fetching attendance records",
//                 error: error.message
//             });
//         }
//     }

// //     async getAttendanceByDateEmployee(req, res) {
// //         try {
// //     const { employeeId, date } = req.query;

// //     if (!employeeId || !date) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee ID and date are required",
// //       });
// //     }

// //     // Defensive check for valid ISO date string
// //     const parsedDate = new Date(date);
// //     if (isNaN(parsedDate.getTime())) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid date format. Use YYYY-MM-DD",
// //       });
// //     }

// //     const year = parsedDate.getUTCFullYear();
// //     const month = parsedDate.getUTCMonth() + 1;
// //     const day = parsedDate.getUTCDate();

// //     const attendance = await Attendance.findOne({
// //       employeeId,
// //       "date.year": year,
// //       "date.month": month,
// //       "date.day": day,
// //     });

// //     if (!attendance) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "No attendance record found for this date",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       attendance,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching attendance by date:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Internal server error",
// //       error: error.message,
// //     });
// //   }
// //     }


// // async getAttendanceByDateEmployee(req, res) {
// //   try {
// //     const { employeeId, date } = req.query;

// //     if (!employeeId || !date) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee ID and date are required",
// //       });
// //     }

// //     // Parse the date in DD-MM-YYYY format
// //     const [day, month, year] = date.split('-').map(Number);
// //     const parsedDate = new Date(year, month - 1, day);

// //     if (isNaN(parsedDate.getTime())) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid date format. Use DD-MM-YYYY",
// //       });
// //     }

// //     const attendance = await Attendance.findOne({
// //       employeeId,
// //       "date.year": year,
// //       "date.month": month,
// //       "date.day": day,
// //     });

// //     if (!attendance) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "No attendance record found for this date",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       attendance,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching attendance by date:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Internal server error",
// //       error: error.message,
// //     });
// //   }
// // }


//     async getStoreAttendance(req, res) {
//         try {
//             const { storeId } = req.params;
//             console.log(`Getting attendance for store: ${storeId}`);

//             // Normalize store ID from various formats
//             let normalizedStoreId = storeId;

//             // If it looks like a store code format (e.g., A-O8WKNG), use directly
//             // Otherwise, try to find the store by ID or code
//             const store = await Store.findOne({
//                 $or: [
//                     { _id: storeId },
//                     { StoreCode: storeId }
//                 ]
//             });

//             if (!store) {
//                 console.log(`Store not found: ${storeId}`);
//                 return res.status(404).json({
//                     success: false,
//                     message: "Store not found"
//                 });
//             }

//             // Use store code for consistency
//             normalizedStoreId = store.StoreCode;
//             console.log(`Using normalized store code: ${normalizedStoreId}`);

//             // Get the user's role and check permission
//             const userRole = (req.user?.Role || '').toLowerCase();
//             let isAuthorized = true; // Default to true for most roles

//             // For site managers and assistant managers, verify store assignment
//             if (userRole === 'sitemanager' || userRole === 'site_manager' ||
//                 userRole === 'assistantmanager' || userRole === 'assistant_manager') {

//                 console.log(`Checking if ${userRole} is assigned to store ${normalizedStoreId}`);
//                 console.log(`User's assigned store: ${req.user?.AssignedStore}`);

//                 // Check if user is assigned to this store
//                 isAuthorized = req.user?.AssignedStore === normalizedStoreId;
//             }
//             // For clients, check store list
//             else if (userRole === 'client') {
//                 const storeIds = req.user.Stores || [];
//                 const storeFilter = storeIds.map(s =>
//                     typeof s === 'object' ? s.StoreCode : s
//                 );

//                 isAuthorized = storeFilter.includes(normalizedStoreId);
//                 console.log(`Client store check for ${normalizedStoreId}: ${isAuthorized}`);
//             }

//             if (!isAuthorized) {
//                 console.log(`User not authorized for store: ${normalizedStoreId}`);
//                 return res.status(403).json({
//                     success: false,
//                     message: "Not authorized to access this store's attendance"
//                 });
//             }

//             // Find attendance records using the normalized store code
//             const attendance = await Attendance.find({
//                 store: normalizedStoreId
//             })
//                 .populate("employeeId", "Name EmployeeId Department ProfilePhoto")
//                 .sort({ date: -1 });

//             console.log(`Found ${attendance.length} attendance records for store ${normalizedStoreId}`);

//             const stats = {
//                 total: attendance.length,
//                 present: attendance.filter(a => a.status === 'present').length,
//                 absent: attendance.filter(a => a.status === 'absent').length,
//                 halfDay: attendance.filter(a => a.status === 'halfDay').length
//             };

//             return res.status(200).json({
//                 success: true,
//                 stats,
//                 storeName: store.StoreName,
//                 storeCode: store.StoreCode,
//                 attendance
//             });
//         } catch (error) {
//             console.error("Error fetching store attendance:", error);
//             return res.status(500).json({
//                 success: false,
//                 message: "Error fetching store attendance",
//                 error: error.message
//             });
//         }
//     }

//     async getAttendanceStats(req, res) {
//         try {
//             const { startDate, endDate, storeCode } = req.query;

//             const query = {};
//             if (startDate && endDate) {
//                 query.date = {
//                     $gte: new Date(startDate),
//                     $lte: new Date(endDate)
//                 };
//             }
//             if (storeCode) {
//                 query.store = storeCode;
//             }

//             const attendance = await Attendance.find(query);
//             const totalEmployees = await Employee.countDocuments({ Status: 'Active' });

//             const stats = {
//                 totalEmployees,
//                 present: attendance.filter(a => a.status === 'present').length,
//                 absent: attendance.filter(a => a.status === 'absent').length,
//                 halfDay: attendance.filter(a => a.status === 'halfDay').length
//             };

//             res.json({
//                 success: true,
//                 stats
//             });
//         } catch (error) {
//             res.status(500).json({ message: "Error fetching attendance statistics" });
//         }
//     }

//     async updateAttendance(req, res) {
//         try {
//             const { id } = req.params;
//             const { checkIn, checkOut, status, remarks } = req.body;

//             const attendance = await Attendance.findByIdAndUpdate(
//                 id,
//                 {
//                     checkIn,
//                     checkOut,
//                     status,
//                     remarks,
//                     markedBy: req.user?.name || 'System'
//                 },
//                 { new: true }
//             ).populate("employeeId", "Name EmployeeId")
//                 .populate("store", "StoreName StoreCode");

//             if (!attendance) {
//                 return res.status(404).json({ message: "Attendance record not found" });
//             }

//             res.json({
//                 success: true,
//                 attendance
//             });
//         } catch (error) {
//             res.status(500).json({ message: "Error updating attendance" });
//         }
//     }

//     async verifyAttendance(req, res) {
//         try {
//             console.log('Verifying attendance:', req.params.id);
//             const { id } = req.params;
//             const { verified, remarks, clientId, storeCode } = req.body;

//             console.log('Verification details:', {
//                 verified, remarks, clientId, storeCode,
//                 userRole: req.user?.Role
//             });

//             // Find the attendance record
//             const attendance = await Attendance.findById(id);
//             if (!attendance) {
//                 console.log('Attendance record not found');
//                 return res.status(404).json({
//                     success: false,
//                     message: "Attendance record not found"
//                 });
//             }

//             // Log the attendance record store value for debugging
//             console.log('Found attendance record:', {
//                 id: attendance._id,
//                 employeeId: attendance.employeeId,
//                 store: attendance.store,
//                 date: attendance.date
//             });

//             // Log client's store access for debugging
//             console.log('Client stores:', req.user?.Stores);

//             // The critical issue - authorization check for client
//             let isAuthorized = false;

//             // Check user role - must be a client
//             if (req.user && req.user.Role && req.user.Role.toLowerCase() === 'client') {
//                 console.log('Client role verified');

//                 // IMPORTANT: Make this check more flexible
//                 // Check if client stores include this attendance store
//                 if (req.user.Stores && req.user.Stores.length > 0) {
//                     // First convert client stores to array of strings for easier comparison
//                     const clientStores = req.user.Stores.map(store => {
//                         // Handle different store formats
//                         if (typeof store === 'object') {
//                             // Return all possible identifiers
//                             return store.StoreCode || store._id?.toString() || store.toString();
//                         }
//                         return store.toString();
//                     });

//                     // The attendance store value
//                     const attendanceStore = attendance.store;

//                     console.log('Comparing attendance store:', attendanceStore);
//                     console.log('With client stores:', clientStores);

//                     // Check direct match
//                     if (clientStores.includes(attendanceStore)) {
//                         isAuthorized = true;
//                         console.log('Store match found: direct match');
//                     }
//                     // Check case-insensitive match
//                     else if (clientStores.some(s =>
//                         typeof attendanceStore === 'string' &&
//                         s.toLowerCase() === attendanceStore.toLowerCase()
//                     )) {
//                         isAuthorized = true;
//                         console.log('Store match found: case-insensitive match');
//                     }
//                     // Try to find the store by code
//                     else {
//                         try {
//                             // Lookup the store using the code
//                             const storeObj = await Store.findOne({
//                                 StoreCode: attendanceStore
//                             });

//                             if (storeObj && clientStores.includes(storeObj._id.toString())) {
//                                 isAuthorized = true;
//                                 console.log('Store match found: ID match through lookup');
//                             }
//                         } catch (lookupError) {
//                             console.error('Error in store lookup:', lookupError);
//                         }
//                     }

//                     // ⚠️ Temporary override for debugging - allow all clients to verify
//                     console.log('⚠️ Temporarily bypassing client store authorization check');
//                     isAuthorized = true;
//                 }
//             }

//             if (!isAuthorized) {
//                 console.log('Client not authorized to verify this attendance');
//                 return res.status(403).json({
//                     success: false,
//                     message: "You are not authorized to verify attendance for this store"
//                 });
//             }

//             // Update the attendance record
//             attendance.verifiedByClient = verified;
//             attendance.verifiedAt = new Date();

//             // Add verification remarks if provided
//             if (remarks) {
//                 attendance.remarks = attendance.remarks ?
//                     `${attendance.remarks}\nVerification note: ${remarks}` :
//                     `Verification note: ${remarks}`;
//             }

//             await attendance.save();
//             console.log('Attendance verification saved successfully');

//             return res.status(200).json({
//                 success: true,
//                 message: `Attendance ${verified ? 'verified' : 'rejected'} successfully`,
//                 attendance
//             });
//         } catch (error) {
//             console.error("Error verifying attendance:", error);
//             return res.status(500).json({
//                 success: false,
//                 message: "Error verifying attendance",
//                 error: error.message
//             });
//         }
//     }
// }

// module.exports = new AttendanceController();














// const Attendance = require("../models/Attendance")
// const Store = require("../models/Store")
// const Employee = require("../models/Employee")
// const Client = require("../models/Client")
// const mongoose = require("mongoose")

// class AttendanceController {
//   // Helper to format duration in H:MM
//   formatDuration(minutes) {
//     if (typeof minutes !== "number" || minutes < 0) return "0:00"
//     const hours = Math.floor(minutes / 60)
//     const remainingMinutes = minutes % 60
//     return `${hours}:${remainingMinutes.toString().padStart(2, "0")}`
//   }

//   async getAttendance(req, res) {
//     try {
//       const { employeeId, storeCode, startDate, endDate } = req.query
//       const query = {}

//       if (employeeId) {
//         if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//           return res.status(400).json({ success: false, message: "Invalid employee ID format" })
//         }
//         query.employeeId = new mongoose.Types.ObjectId(employeeId)
//       }

//       if (storeCode) {
//         const store = await Store.findOne({ StoreCode: storeCode })
//         if (!store) {
//           return res.status(404).json({ success: false, message: "Store not found for the given code" })
//         }
//         query.store = store._id
//       }

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
//             end.setHours(23, 59, 59, 999)
//             dateFilter.$lte = end
//           }
//         }
//         if (Object.keys(dateFilter).length > 0) {
//           query["date.full"] = dateFilter
//         }
//       }

//       const attendance = await Attendance.find(query)
//         .populate("employeeId", "Name EmployeeId")
//         .populate("store", "StoreName StoreCode")
//         .sort({ "date.full": -1 })

//       const transformedAttendance = attendance.map((record) => ({
//         id: record._id,
//         employeeId: record.employeeId?.EmployeeId || "",
//         employeeName: record.employeeId?.Name || "",
//         store: record.store?.StoreCode || "",
//         storeName: record.store?.StoreName || "",
//         date: record.date?.full ? new Date(record.date.full).toISOString().split("T")[0] : "-",
//         checkIn: record.checkIn || "-",
//         checkOut: record.checkOut || "-",
//         status: record.status,
//         verifiedByClient: record.verifiedByClient,
//         markedBy: record.markedBy,
//         remarks: record.remarks,
//         breaks: record.breaks || [],
//         totalBreakTime: record.totalBreakTime || 0,
//         totalWorkingTime: record.totalWorkingTime || 0,
//         formattedWorkingTime: this.formatDuration(record.totalWorkingTime),
//         formattedBreakTime: this.formatDuration(record.totalBreakTime),
//       }))

//       res.json({
//         success: true,
//         attendance: transformedAttendance,
//       })
//     } catch (error) {
//       console.error("Error fetching attendance records:", error)
//       res.status(500).json({ message: "Error fetching attendance records" })
//     }
//   }

//   async markAttendance(req, res) {
//     try {
//       console.log("Marking attendance with data:", JSON.stringify(req.body))
//       const { employeeId, storeCode, date, status, checkIn, checkOut, remarks, breaks, totalBreakTime } = req.body

//       if (!employeeId || !date || !status) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID, date and status are required",
//         })
//       }

//       const employee = await Employee.findById(employeeId)
//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found",
//         })
//       }

//       const attendanceDate = new Date(date)
//       if (isNaN(attendanceDate.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format",
//         })
//       }
//       attendanceDate.setHours(0, 0, 0, 0)
//       const year = attendanceDate.getFullYear()
//       const month = attendanceDate.getMonth() + 1
//       const day = attendanceDate.getDate()

//       const normalizedStoreCode = Array.isArray(storeCode) ? storeCode[0] : storeCode
//       const store = await Store.findOne({ StoreCode: normalizedStoreCode })
//       if (!store) {
//         return res.status(404).json({ success: false, message: "Store not found for the given code" })
//       }
//       const storeObjectId = store._id

//       const attendanceCollection = mongoose.connection.db.collection("attendances")

//       const existingRecord = await attendanceCollection.findOne({
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (existingRecord) {
//         const updateData = {
//           status,
//           checkIn: checkIn || existingRecord.checkIn,
//           checkOut: checkOut || existingRecord.checkOut,
//           breaks: breaks || existingRecord.breaks || [],
//           totalBreakTime: totalBreakTime ?? (existingRecord.totalBreakTime || 0),
//           remarks: remarks || existingRecord.remarks,
//           markedBy: req.user?.Name || req.user?.name || "System",
//           updatedAt: new Date(),
//         }

//         if ((checkIn || existingRecord.checkIn) && checkOut) {
//           const workingMinutes =
//             this.calculateDuration(checkIn || existingRecord.checkIn, checkOut) -
//             (totalBreakTime ?? (existingRecord.totalBreakTime || 0))
//           updateData.totalWorkingTime = Math.max(0, workingMinutes)
//         }

//         await attendanceCollection.updateOne({ _id: existingRecord._id }, { $set: updateData })

//         return res.status(200).json({
//           success: true,
//           message: "Attendance updated successfully",
//           attendance: {
//             ...existingRecord,
//             ...updateData,
//           },
//         })
//       }

//       const newRecord = {
//         _id: new mongoose.Types.ObjectId(),
//         employeeId: new mongoose.Types.ObjectId(employeeId),
//         worker: new mongoose.Types.ObjectId(employeeId),
//         store: storeObjectId,
//         date: {
//           full: attendanceDate,
//           year,
//           month,
//           day,
//         },
//         status,
//         checkIn: checkIn || null,
//         checkOut: checkOut || null,
//         breaks: breaks || [],
//         totalBreakTime: totalBreakTime || 0,
//         totalWorkingTime: 0,
//         remarks: remarks || "",
//         verifiedByClient: false,
//         markedBy: req.user?.Name || req.user?.name || "System",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }

//       if (checkIn && checkOut) {
//         const workingMinutes = this.calculateDuration(checkIn, checkOut) - (totalBreakTime || 0)
//         newRecord.totalWorkingTime = Math.max(0, workingMinutes)
//       }

//       const insertResult = await attendanceCollection.insertOne(newRecord)

//       if (insertResult.acknowledged) {
//         return res.status(201).json({
//           success: true,
//           message: "Attendance marked successfully",
//           attendance: newRecord,
//         })
//       }

//       throw new Error("Failed to insert attendance record")
//     } catch (error) {
//       console.error("Error marking attendance:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   calculateDuration(startTime, endTime) {
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

//   async getAttendanceByDate(req, res) {
//     try {
//       const { date } = req.params
//       const { employeeId } = req.query

//       if (!date) {
//         return res.status(400).json({ success: false, message: "Date is required" })
//       }

//       let day, month, year
//       const dateParts = date.split("-")
//       if (dateParts.length !== 3) {
//         return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" })
//       }
//       ;[year, month, day] = dateParts.map(Number)

//       if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
//         return res.status(400).json({ success: false, message: "Invalid date values" })
//       }

//       const query = {
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       }

//       if (employeeId) {
//         if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//           return res.status(400).json({ success: false, message: "Invalid employee ID format" })
//         }
//         query.employeeId = new mongoose.Types.ObjectId(employeeId)
//       }

//       const attendanceRecords = await Attendance.find(query)
//         .populate("employeeId", "Name EmployeeId")
//         .populate("store", "StoreName StoreCode")

//       const transformedAttendance = attendanceRecords.map((record) => ({
//         id: record._id,
//         employeeId: record.employeeId?.EmployeeId || "",
//         employeeName: record.employeeId?.Name || "",
//         store: record.store?.StoreCode || "",
//         storeName: record.store?.StoreName || "",
//         date: record.date?.full ? new Date(record.date.full).toISOString().split("T")[0] : "-",
//         checkIn: record.checkIn || "-",
//         checkOut: record.checkOut || "-",
//         status: record.status,
//         verifiedByClient: record.verifiedByClient,
//         markedBy: record.markedBy,
//         remarks: record.remarks,
//         breaks: record.breaks || [],
//         totalBreakTime: record.totalBreakTime || 0,
//         totalWorkingTime: record.totalWorkingTime || 0,
//         formattedWorkingTime: this.formatDuration(record.totalWorkingTime),
//         formattedBreakTime: this.formatDuration(record.totalBreakTime),
//       }))

//       res.status(200).json({
//         success: true,
//         attendance: transformedAttendance,
//       })
//     } catch (error) {
//       console.error("Error fetching attendance by date:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   async getAttendanceByDateEmployee(req, res) {
//     try {
//       const { employeeId, date } = req.query
//       if (!employeeId || !date) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID and date are required",
//         })
//       }

//       const dateParts = date.split("-")
//       if (dateParts.length !== 3) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format. Use DD-MM-YYYY",
//         })
//       }

//       const [day, month, year] = dateParts.map(Number)

//       if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format. Use DD-MM-YYYY",
//         })
//       }

//       const attendance = await Attendance.findOne({
//         employeeId,
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendance) {
//         return res.status(404).json({
//           success: false,
//           message: "No attendance record found for this date",
//         })
//       }

//       return res.status(200).json({
//         success: true,
//         attendance,
//       })
//     } catch (error) {
//       console.error("Error fetching attendance by date:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   async createOrUpdateAttendance(req, res) {
//     try {
//       const { employeeId, storeCode, date, status, checkIn, checkOut, breaks, totalBreakTime } = req.body

//       if (!employeeId || !storeCode || !date || !status) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID, store code, date, and status are required",
//         })
//       }

//       const attendanceDate = new Date(date)
//       if (isNaN(attendanceDate.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format",
//         })
//       }

//       const dateObj = {
//         year: attendanceDate.getFullYear(),
//         month: attendanceDate.getMonth() + 1,
//         day: attendanceDate.getDate(),
//       }

//       const store = await Store.findOne({ StoreCode: storeCode })
//       if (!store) {
//         return res.status(404).json({ success: false, message: "Store not found for the given code" })
//       }
//       const storeObjectId = store._id

//       let attendance = await Attendance.findOne({
//         employeeId,
//         "date.year": dateObj.year,
//         "date.month": dateObj.month,
//         "date.day": dateObj.day,
//       })

//       if (!attendance) {
//         if (!checkIn) {
//           return res.status(400).json({
//             success: false,
//             message: "Check-in time is required for new attendance record",
//           })
//         }

//         attendance = new Attendance({
//           employeeId,
//           store: storeObjectId,
//           date: dateObj,
//           status,
//           checkIn,
//           checkOut: checkOut || null,
//           breaks: breaks || [],
//           totalBreakTime: totalBreakTime || 0,
//           totalWorkingTime: 0,
//         })

//         if (checkIn && checkOut) {
//           const workingMinutes = this.calculateDuration(checkIn, checkOut) - (totalBreakTime || 0)
//           attendance.totalWorkingTime = Math.max(0, workingMinutes)
//         }

//         await attendance.save()
//         return res.status(201).json({
//           success: true,
//           message: "Attendance record created successfully",
//           attendance,
//         })
//       } else {
//         if (checkIn && !attendance.checkIn) {
//           attendance.checkIn = checkIn
//         }
//         if (checkOut) {
//           attendance.checkOut = checkOut
//           attendance.breaks = breaks || attendance.breaks || []
//           attendance.totalBreakTime = totalBreakTime || attendance.totalBreakTime || 0

//           const workingMinutes = this.calculateDuration(attendance.checkIn, checkOut) - attendance.totalBreakTime
//           attendance.totalWorkingTime = Math.max(0, workingMinutes)
//         }

//         attendance.status = status
//         attendance.updatedAt = new Date()

//         await attendance.save()
//         return res.status(200).json({
//           success: true,
//           message: "Attendance record updated successfully",
//           attendance,
//         })
//       }
//     } catch (error) {
//       console.error("Error creating/updating attendance:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   async getAttendanceWithCalculations(req, res) {
//     try {
//       const { employeeId, date } = req.query
//       if (!employeeId || !date) {
//         return res.status(400).json({
//           success: false,
//           message: "Employee ID and date are required",
//         })
//       }

//       const [day, month, year] = date.split("-").map(Number)

//       const attendance = await Attendance.findOne({
//         employeeId,
//         "date.year": year,
//         "date.month": month,
//         "date.day": day,
//       })

//       if (!attendance) {
//         return res.status(404).json({
//           success: false,
//           message: "No attendance record found for this date",
//         })
//       }

//       if (attendance.checkIn && attendance.checkOut) {
//         const totalBreakTime = attendance.totalBreakTime || 0
//         const workingMinutes = this.calculateDuration(attendance.checkIn, attendance.checkOut) - totalBreakTime
//         attendance.totalWorkingTime = Math.max(0, workingMinutes)

//         await attendance.save()
//       }

//       return res.status(200).json({
//         success: true,
//         attendance,
//       })
//     } catch (error) {
//       console.error("Error fetching attendance:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }

//   async getStoreAttendance(req, res) {
//     try {
//       const { storeId } = req.params
//       console.log(`Getting attendance for store: ${storeId}`)

//       const store = await Store.findOne({
//         $or: [{ _id: storeId }, { StoreCode: storeId }],
//       })

//       if (!store) {
//         console.log(`Store not found: ${storeId}`)
//         return res.status(404).json({
//           success: false,
//           message: "Store not found",
//         })
//       }

//       const storeObjectId = store._id

//       const userRole = (req.user?.Role || "").toLowerCase()
//       let isAuthorized = true

//       if (
//         userRole === "sitemanager" ||
//         userRole === "site_manager" ||
//         userRole === "assistantmanager" ||
//         userRole === "assistant_manager"
//       ) {
//         isAuthorized = req.user?.AssignedStore === store.StoreCode
//       } else if (userRole === "client") {
//         const clientStoreIds = req.user.Stores || []
//         isAuthorized = clientStoreIds.some((s) => s.toString() === storeObjectId.toString())
//       }

//       if (!isAuthorized) {
//         console.log(`User not authorized for store: ${store.StoreCode}`)
//         return res.status(403).json({
//           success: false,
//           message: "Not authorized to access this store's attendance",
//         })
//       }

//       const attendance = await Attendance.find({
//         store: storeObjectId,
//       })
//         .populate("employeeId", "Name EmployeeId Department ProfilePhoto")
//         .sort({ date: -1 })

//       console.log(`Found ${attendance.length} attendance records for store ${store.StoreCode}`)

//       const stats = {
//         total: attendance.length,
//         present: attendance.filter((a) => a.status === "present").length,
//         absent: attendance.filter((a) => a.status === "absent").length,
//         halfDay: attendance.filter((a) => a.status === "halfDay").length,
//       }

//       return res.status(200).json({
//         success: true,
//         stats,
//         storeName: store.StoreName,
//         storeCode: store.StoreCode,
//         attendance,
//       })
//     } catch (error) {
//       console.error("Error fetching store attendance:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Error fetching store attendance",
//         error: error.message,
//       })
//     }
//   }

//   async getAttendanceStats(req, res) {
//     try {
//       const { startDate, endDate, storeCode } = req.query
//       const query = {}

//       if (startDate && endDate) {
//         query.date = {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         }
//       }

//       if (storeCode) {
//         const store = await Store.findOne({ StoreCode: storeCode })
//         if (!store) {
//           return res.status(404).json({ success: false, message: "Store not found for the given code" })
//         }
//         query.store = store._id
//       }

//       const attendance = await Attendance.find(query)
//       const totalEmployees = await Employee.countDocuments({ Status: "Active" })

//       const stats = {
//         totalEmployees,
//         present: attendance.filter((a) => a.status === "present").length,
//         absent: attendance.filter((a) => a.status === "absent").length,
//         halfDay: attendance.filter((a) => a.status === "halfDay").length,
//       }

//       res.json({
//         success: true,
//         stats,
//       })
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching attendance statistics" })
//     }
//   }

//   async updateAttendance(req, res) {
//     try {
//       const { id } = req.params
//       const { checkIn, checkOut, status, remarks, breaks, totalBreakTime } = req.body // Added breaks and totalBreakTime

//       const attendance = await Attendance.findById(id)
//       if (!attendance) {
//         return res.status(404).json({ message: "Attendance record not found" })
//       }

//       attendance.checkIn = checkIn || attendance.checkIn
//       attendance.checkOut = checkOut || attendance.checkOut
//       attendance.status = status || attendance.status
//       attendance.remarks = remarks || attendance.remarks
//       attendance.breaks = breaks || attendance.breaks || [] // Update breaks
//       attendance.totalBreakTime = totalBreakTime ?? (attendance.totalBreakTime || 0) // Update totalBreakTime
//       attendance.markedBy = req.user?.name || "System"
//       attendance.updatedAt = new Date()

//       // Recalculate totalWorkingTime if checkIn and checkOut are present
//       if (attendance.checkIn && attendance.checkOut) {
//         const workingMinutes =
//           this.calculateDuration(attendance.checkIn, attendance.checkOut) - attendance.totalBreakTime
//         attendance.totalWorkingTime = Math.max(0, workingMinutes)
//       }

//       await attendance.save()

//       // Re-populate for the response
//       await attendance.populate("employeeId", "Name EmployeeId")
//       await attendance.populate("store", "StoreName StoreCode")

//       res.json({
//         success: true,
//         attendance,
//       })
//     } catch (error) {
//       res.status(500).json({ message: "Error updating attendance" })
//     }
//   }

//   async verifyAttendance(req, res) {
//     try {
//       console.log("Verifying attendance:", req.params.id)
//       const { id } = req.params
//       const { verified, remarks, clientId, storeCode } = req.body

//       console.log("Verification details:", {
//         verified,
//         remarks,
//         clientId,
//         storeCode,
//         userRole: req.user?.Role,
//       })

//       const attendance = await Attendance.findById(id)
//       if (!attendance) {
//         console.log("Attendance record not found")
//         return res.status(404).json({
//           success: false,
//           message: "Attendance record not found",
//         })
//       }

//       console.log("Found attendance record:", {
//         id: attendance._id,
//         employeeId: attendance.employeeId,
//         store: attendance.store,
//         date: attendance.date,
//       })

//       console.log("Client stores from user object:", req.user?.Stores)

//       let isAuthorized = false

//       if (req.user && req.user.Role && req.user.Role.toLowerCase() === "client") {
//         console.log("Client role verified")
//         if (req.user.Stores && req.user.Stores.length > 0) {
//           const clientAuthorizedStoreObjectIds = []
//           for (const storeIdentifier of req.user.Stores) {
//             if (mongoose.Types.ObjectId.isValid(storeIdentifier)) {
//               clientAuthorizedStoreObjectIds.push(new mongoose.Types.ObjectId(storeIdentifier))
//             } else {
//               // Assume it's a StoreCode, find its ObjectId
//               const foundStore = await Store.findOne({ StoreCode: storeIdentifier })
//               if (foundStore) {
//                 clientAuthorizedStoreObjectIds.push(foundStore._id)
//               } else {
//                 console.warn(`Could not find store for identifier: ${storeIdentifier}`)
//               }
//             }
//           }

//           // Check if the attendance record's store ObjectId is in the client's authorized stores
//           if (clientAuthorizedStoreObjectIds.some((id) => id.equals(attendance.store))) {
//             isAuthorized = true
//             console.log("Store match found: client authorized for this store's ObjectId")
//           } else {
//             console.log("No direct ObjectId match for client store authorization.")
//           }
//         }
//       }

//       if (!isAuthorized) {
//         console.log("Client not authorized to verify this attendance")
//         return res.status(403).json({
//           success: false,
//           message: "You are not authorized to verify attendance for this store",
//         })
//       }

//       attendance.verifiedByClient = verified
//       attendance.verifiedAt = new Date()

//       if (remarks) {
//         attendance.remarks = attendance.remarks
//           ? `${attendance.remarks}\nVerification note: ${remarks}`
//           : `Verification note: ${remarks}`
//       }

//       await attendance.save()

//       console.log("Attendance verification saved successfully")

//       return res.status(200).json({
//         success: true,
//         message: `Attendance ${verified ? "verified" : "rejected"} successfully`,
//         attendance,
//       })
//     } catch (error) {
//       console.error("Error verifying attendance:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Error verifying attendance",
//         error: error.message,
//       })
//     }
//   }
// }

// module.exports = new AttendanceController()







const Attendance = require("../models/Attendance")
const Store = require("../models/Store")
const Employee = require("../models/Employee")
const Client = require("../models/Client")
const mongoose = require("mongoose")

class AttendanceController {
  // Helper to format duration in H:MM
  formatDuration = (minutes) => {
    // Changed to arrow function
    if (typeof minutes !== "number" || minutes < 0) return "0:00"
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}:${remainingMinutes.toString().padStart(2, "0")}`
  }

  getAttendance = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId, storeCode, startDate, endDate } = req.query
      const query = {}

      if (employeeId) {
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
          return res.status(400).json({ success: false, message: "Invalid employee ID format" })
        }
        query.employeeId = new mongoose.Types.ObjectId(employeeId)
      }

      if (storeCode) {
        const store = await Store.findOne({ StoreCode: storeCode })
        if (!store) {
          return res.status(404).json({ success: false, message: "Store not found for the given code" })
        }
        query.store = store._id
      }

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
            end.setHours(23, 59, 59, 999)
            dateFilter.$lte = end
          }
        }
        if (Object.keys(dateFilter).length > 0) {
          query["date.full"] = dateFilter
        }
      }

      const attendance = await Attendance.find(query)
        .populate("employeeId", "Name EmployeeId")
        .populate("store", "StoreName StoreCode")
        .sort({ "date.full": -1 })

      const transformedAttendance = attendance.map((record) => ({
        id: record._id,
        employeeId: record.employeeId?.EmployeeId || "",
        employeeName: record.employeeId?.Name || "",
        store: record.store?.StoreCode || "",
        storeName: record.store?.StoreName || "",
        date: record.date?.full ? new Date(record.date.full).toISOString().split("T")[0] : "-",
        checkIn: record.checkIn || "-",
        checkOut: record.checkOut || "-",
        status: record.status,
        verifiedByClient: record.verifiedByClient,
        markedBy: record.markedBy,
        remarks: record.remarks,
        breaks: record.breaks || [],
        totalBreakTime: record.totalBreakTime || 0,
        totalWorkingTime: record.totalWorkingTime || 0,
        formattedWorkingTime: this.formatDuration(record.totalWorkingTime),
        formattedBreakTime: this.formatDuration(record.totalBreakTime),
      }))

      res.json({
        success: true,
        attendance: transformedAttendance,
      })
    } catch (error) {
      console.error("Error fetching attendance records:", error)
      res.status(500).json({ message: "Error fetching attendance records" })
    }
  }

  markAttendance = async (req, res) => {
    // Changed to arrow function
    try {
      console.log("Marking attendance with data:", JSON.stringify(req.body))
      const { employeeId, storeCode, date, status, checkIn, checkOut, remarks, breaks, totalBreakTime } = req.body

      if (!employeeId || !date || !status) {
        return res.status(400).json({
          success: false,
          message: "Employee ID, date and status are required",
        })
      }

      const employee = await Employee.findById(employeeId)
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        })
      }

      const attendanceDate = new Date(date)
      if (isNaN(attendanceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        })
      }
      attendanceDate.setHours(0, 0, 0, 0)

      const year = attendanceDate.getFullYear()
      const month = attendanceDate.getMonth() + 1
      const day = attendanceDate.getDate()

      const normalizedStoreCode = Array.isArray(storeCode) ? storeCode[0] : storeCode
      const store = await Store.findOne({ StoreCode: normalizedStoreCode })
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found for the given code" })
      }
      const storeObjectId = store._id

      const attendanceCollection = mongoose.connection.db.collection("attendances")

      const existingRecord = await attendanceCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (existingRecord) {
        const updateData = {
          status,
          checkIn: checkIn || existingRecord.checkIn,
          checkOut: checkOut || existingRecord.checkOut,
          breaks: breaks || existingRecord.breaks || [],
          totalBreakTime: totalBreakTime ?? (existingRecord.totalBreakTime || 0),
          remarks: remarks || existingRecord.remarks,
          markedBy: req.user?.Name || req.user?.name || "System",
          updatedAt: new Date(),
        }

        if ((checkIn || existingRecord.checkIn) && checkOut) {
          const workingMinutes =
            this.calculateDuration(checkIn || existingRecord.checkIn, checkOut) -
            (totalBreakTime ?? (existingRecord.totalBreakTime || 0))
          updateData.totalWorkingTime = Math.max(0, workingMinutes)
        }

        await attendanceCollection.updateOne({ _id: existingRecord._id }, { $set: updateData })

        return res.status(200).json({
          success: true,
          message: "Attendance updated successfully",
          attendance: {
            ...existingRecord,
            ...updateData,
          },
        })
      }

      const newRecord = {
        _id: new mongoose.Types.ObjectId(),
        employeeId: new mongoose.Types.ObjectId(employeeId),
        worker: new mongoose.Types.ObjectId(employeeId),
        store: storeObjectId,
        date: {
          full: attendanceDate,
          year,
          month,
          day,
        },
        status,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        breaks: breaks || [],
        totalBreakTime: totalBreakTime || 0,
        totalWorkingTime: 0,
        remarks: remarks || "",
        verifiedByClient: false,
        markedBy: req.user?.Name || req.user?.name || "System",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (checkIn && checkOut) {
        const workingMinutes = this.calculateDuration(checkIn, checkOut) - (totalBreakTime || 0)
        newRecord.totalWorkingTime = Math.max(0, workingMinutes)
      }

      const insertResult = await attendanceCollection.insertOne(newRecord)

      if (insertResult.acknowledged) {
        return res.status(201).json({
          success: true,
          message: "Attendance marked successfully",
          attendance: newRecord,
        })
      }

      throw new Error("Failed to insert attendance record")
    } catch (error) {
      console.error("Error marking attendance:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  calculateDuration = (startTime, endTime) => {
    // Changed to arrow function
    if (!startTime || !endTime) return 0
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const today = new Date()
    const startDate = new Date(today)
    const endDate = new Date(today)

    startDate.setHours(startHour, startMinute, 0, 0)
    endDate.setHours(endHour, endMinute, 0, 0)

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1)
    }

    const diffInMs = endDate - startDate
    return Math.round(diffInMs / (1000 * 60))
  }

  getAttendanceByDate = async (req, res) => {
    // Changed to arrow function
    try {
      const { date } = req.params
      const { employeeId, storeCode } = req.query

      // Log the received storeCode for debugging
      console.log(`getAttendanceByDate: Received storeCode: ${storeCode} (Type: ${typeof storeCode})`)

      if (!date) {
        return res.status(400).json({ success: false, message: "Date is required" })
      }

      let day, month, year
      const dateParts = date.split("-")
      if (dateParts.length !== 3) {
        return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" })
      }
      ;[year, month, day] = dateParts.map(Number)

      if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
        return res.status(400).json({ success: false, message: "Invalid date values" })
      }

      const query = {
        "date.year": year,
        "date.month": month,
        "date.day": day,
      }

      if (employeeId) {
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
          return res.status(400).json({ success: false, message: "Invalid employee ID format" })
        }
        query.employeeId = new mongoose.Types.ObjectId(employeeId)
      }

      if (storeCode) {
        const store = await Store.findOne({ StoreCode: storeCode })
        if (!store) {
          return res.status(404).json({ success: false, message: "Store not found for the given code" })
        }
        query.store = store._id
      }

      const attendanceRecords = await Attendance.find(query)
        .populate("employeeId", "Name EmployeeId")
        .populate("store", "StoreName StoreCode")

      const transformedAttendance = attendanceRecords.map((record) => ({
        id: record._id,
        employeeId: record.employeeId?.EmployeeId || "",
        employeeName: record.employeeId?.Name || "",
        store: record.store?.StoreCode || "",
        storeName: record.store?.StoreName || "",
        date: record.date?.full ? new Date(record.date.full).toISOString().split("T")[0] : "-",
        checkIn: record.checkIn || "-",
        checkOut: record.checkOut || "-",
        status: record.status,
        verifiedByClient: record.verifiedByClient,
        markedBy: record.markedBy,
        remarks: record.remarks,
        breaks: record.breaks || [],
        totalBreakTime: record.totalBreakTime || 0,
        totalWorkingTime: record.totalWorkingTime || 0,
        formattedWorkingTime: this.formatDuration(record.totalWorkingTime),
        formattedBreakTime: this.formatDuration(record.totalBreakTime),
      }))

      res.status(200).json({
        success: true,
        attendance: transformedAttendance,
      })
    } catch (error) {
      console.error("Error fetching attendance by date:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  getAttendanceByDateEmployee = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId, date } = req.query
      if (!employeeId || !date) {
        return res.status(400).json({
          success: false,
          message: "Employee ID and date are required",
        })
      }

      const dateParts = date.split("-")
      if (dateParts.length !== 3) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use DD-MM-YYYY",
        })
      }
      const [day, month, year] = dateParts.map(Number)

      if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use DD-MM-YYYY",
        })
      }

      const attendance = await Attendance.findOne({
        employeeId,
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "No attendance record found for this date",
        })
      }

      return res.status(200).json({
        success: true,
        attendance,
      })
    } catch (error) {
      console.error("Error fetching attendance by date:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  createOrUpdateAttendance = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId, storeCode, date, status, checkIn, checkOut, breaks, totalBreakTime } = req.body

      if (!employeeId || !storeCode || !date || !status) {
        return res.status(400).json({
          success: false,
          message: "Employee ID, store code, date, and status are required",
        })
      }

      const attendanceDate = new Date(date)
      if (isNaN(attendanceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        })
      }

      const dateObj = {
        year: attendanceDate.getFullYear(),
        month: attendanceDate.getMonth() + 1,
        day: attendanceDate.getDate(),
      }

      const store = await Store.findOne({ StoreCode: storeCode })
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found for the given code" })
      }
      const storeObjectId = store._id

      let attendance = await Attendance.findOne({
        employeeId,
        "date.year": dateObj.year,
        "date.month": dateObj.month,
        "date.day": dateObj.day,
      })

      if (!attendance) {
        if (!checkIn) {
          return res.status(400).json({
            success: false,
            message: "Check-in time is required for new attendance record",
          })
        }

        attendance = new Attendance({
          employeeId,
          store: storeObjectId,
          date: dateObj,
          status,
          checkIn,
          checkOut: checkOut || null,
          breaks: breaks || [],
          totalBreakTime: totalBreakTime || 0,
          totalWorkingTime: 0,
        })

        if (checkIn && checkOut) {
          const workingMinutes = this.calculateDuration(checkIn, checkOut) - (totalBreakTime || 0)
          attendance.totalWorkingTime = Math.max(0, workingMinutes)
        }

        await attendance.save()

        return res.status(201).json({
          success: true,
          message: "Attendance record created successfully",
          attendance,
        })
      } else {
        if (checkIn && !attendance.checkIn) {
          attendance.checkIn = checkIn
        }
        if (checkOut) {
          attendance.checkOut = checkOut
          attendance.breaks = breaks || attendance.breaks || []
          attendance.totalBreakTime = totalBreakTime || attendance.totalBreakTime || 0
          const workingMinutes = this.calculateDuration(attendance.checkIn, checkOut) - attendance.totalBreakTime
          attendance.totalWorkingTime = Math.max(0, workingMinutes)
        }

        attendance.status = status
        attendance.updatedAt = new Date()
        await attendance.save()

        return res.status(200).json({
          success: true,
          message: "Attendance record updated successfully",
          attendance,
        })
      }
    } catch (error) {
      console.error("Error creating/updating attendance:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  getAttendanceWithCalculations = async (req, res) => {
    // Changed to arrow function
    try {
      const { employeeId, date } = req.query
      if (!employeeId || !date) {
        return res.status(400).json({
          success: false,
          message: "Employee ID and date are required",
        })
      }

      const [day, month, year] = date.split("-").map(Number)

      const attendance = await Attendance.findOne({
        employeeId,
        "date.year": year,
        "date.month": month,
        "date.day": day,
      })

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "No attendance record found for this date",
        })
      }

      if (attendance.checkIn && attendance.checkOut) {
        const totalBreakTime = attendance.totalBreakTime || 0
        const workingMinutes = this.calculateDuration(attendance.checkIn, attendance.checkOut) - totalBreakTime
        attendance.totalWorkingTime = Math.max(0, workingMinutes)
        await attendance.save()
      }

      return res.status(200).json({
        success: true,
        attendance,
      })
    } catch (error) {
      console.error("Error fetching attendance:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  getStoreAttendance = async (req, res) => {
    // Changed to arrow function
    try {
      const { storeId } = req.params
      console.log(`Getting attendance for store: ${storeId}`)

      let storeQuery = {}
      // Check if storeId is a valid ObjectId, otherwise assume it's a StoreCode
      if (mongoose.Types.ObjectId.isValid(storeId)) {
        storeQuery = { _id: new mongoose.Types.ObjectId(storeId) }
      } else {
        storeQuery = { StoreCode: storeId }
      }

      const store = await Store.findOne(storeQuery)
      if (!store) {
        console.log(`Store not found: ${storeId}`)
        return res.status(404).json({
          success: false,
          message: "Store not found",
        })
      }
      const storeObjectId = store._id

      const userRole = (req.user?.Role || "").toLowerCase()
      let isAuthorized = true

      if (
        userRole === "sitemanager" ||
        userRole === "site_manager" ||
        userRole === "assistantmanager" ||
        userRole === "assistant_manager"
      ) {
        isAuthorized = req.user?.AssignedStore === store.StoreCode
      } else if (userRole === "client") {
        const clientStoreIds = req.user.Stores || []
        isAuthorized = clientStoreIds.some((s) => s.toString() === storeObjectId.toString())
      }

      if (!isAuthorized) {
        console.log(`User not authorized for store: ${store.StoreCode}`)
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this store's attendance",
        })
      }

      const attendance = await Attendance.find({
        store: storeObjectId,
      })
        .populate("employeeId", "Name EmployeeId Department ProfilePhoto")
        .sort({ date: -1 })

      console.log(`Found ${attendance.length} attendance records for store ${store.StoreCode}`)

      const stats = {
        total: attendance.length,
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        halfDay: attendance.filter((a) => a.status === "halfDay").length,
      }

      return res.status(200).json({
        success: true,
        stats,
        storeName: store.StoreName,
        storeCode: store.StoreCode,
        attendance,
      })
    } catch (error) {
      console.error("Error fetching store attendance:", error)
      return res.status(500).json({
        success: false,
        message: "Error fetching store attendance",
        error: error.message,
      })
    }
  }

  getAttendanceStats = async (req, res) => {
    // Changed to arrow function
    try {
      const { startDate, endDate, storeCode } = req.query
      const query = {}

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      }

      if (storeCode) {
        const store = await Store.findOne({ StoreCode: storeCode })
        if (!store) {
          return res.status(404).json({ success: false, message: "Store not found for the given code" })
        }
        query.store = store._id
      }

      const attendance = await Attendance.find(query)
      const totalEmployees = await Employee.countDocuments({ Status: "Active" })

      const stats = {
        totalEmployees,
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        halfDay: attendance.filter((a) => a.status === "halfDay").length,
      }

      res.json({
        success: true,
        stats,
      })
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance statistics" })
    }
  }

  updateAttendance = async (req, res) => {
    // Changed to arrow function
    try {
      const { id } = req.params
      const { checkIn, checkOut, status, remarks, breaks, totalBreakTime } = req.body // Added breaks and totalBreakTime

      const attendance = await Attendance.findById(id)
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" })
      }

      attendance.checkIn = checkIn || attendance.checkIn
      attendance.checkOut = checkOut || attendance.checkOut
      attendance.status = status || attendance.status
      attendance.remarks = remarks || attendance.remarks
      attendance.breaks = breaks || attendance.breaks || [] // Update breaks
      attendance.totalBreakTime = totalBreakTime ?? (attendance.totalBreakTime || 0) // Update totalBreakTime
      attendance.markedBy = req.user?.name || "System"
      attendance.updatedAt = new Date()

      // Recalculate totalWorkingTime if checkIn and checkOut are present
      if (attendance.checkIn && attendance.checkOut) {
        const workingMinutes =
          this.calculateDuration(attendance.checkIn, attendance.checkOut) - attendance.totalBreakTime
        attendance.totalWorkingTime = Math.max(0, workingMinutes)
      }

      await attendance.save()

      // Re-populate for the response
      await attendance.populate("employeeId", "Name EmployeeId")
      await attendance.populate("store", "StoreName StoreCode")

      res.json({
        success: true,
        attendance,
      })
    } catch (error) {
      res.status(500).json({ message: "Error updating attendance" })
    }
  }

  verifyAttendance = async (req, res) => {
    // Changed to arrow function
    try {
      console.log("Verifying attendance:", req.params.id)
      const { id } = req.params
      const { verified, remarks, clientId, storeCode } = req.body
      console.log("Verification details:", {
        verified,
        remarks,
        clientId,
        storeCode,
        userRole: req.user?.Role,
      })

      const attendance = await Attendance.findById(id)
      if (!attendance) {
        console.log("Attendance record not found")
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        })
      }

      console.log("Found attendance record:", {
        id: attendance._id,
        employeeId: attendance.employeeId,
        store: attendance.store,
        date: attendance.date,
      })
      console.log("Client stores from user object:", req.user?.Stores)

      let isAuthorized = false
      if (req.user && req.user.Role && req.user.Role.toLowerCase() === "client") {
        console.log("Client role verified")
        if (req.user.Stores && req.user.Stores.length > 0) {
          const clientAuthorizedStoreObjectIds = []
          for (const storeIdentifier of req.user.Stores) {
            if (mongoose.Types.ObjectId.isValid(storeIdentifier)) {
              clientAuthorizedStoreObjectIds.push(new mongoose.Types.ObjectId(storeIdentifier))
            } else {
              // Assume it's a StoreCode, find its ObjectId
              const foundStore = await Store.findOne({ StoreCode: storeIdentifier })
              if (foundStore) {
                clientAuthorizedStoreObjectIds.push(foundStore._id)
              } else {
                console.warn(`Could not find store for identifier: ${storeIdentifier}`)
              }
            }
          }

          // Check if the attendance record's store ObjectId is in the client's authorized stores
          if (clientAuthorizedStoreObjectIds.some((id) => id.equals(attendance.store))) {
            isAuthorized = true
            console.log("Store match found: client authorized for this store's ObjectId")
          } else {
            console.log("No direct ObjectId match for client store authorization.")
          }
        }
      }

      if (!isAuthorized) {
        console.log("Client not authorized to verify this attendance")
        return res.status(403).json({
          success: false,
          message: "You are not authorized to verify attendance for this store",
        })
      }

      attendance.verifiedByClient = verified
      attendance.verifiedAt = new Date()
      if (remarks) {
        attendance.remarks = attendance.remarks
          ? `${attendance.remarks}\nVerification note: ${remarks}`
          : `Verification note: ${remarks}`
      }

      await attendance.save()
      console.log("Attendance verification saved successfully")

      return res.status(200).json({
        success: true,
        message: `Attendance ${verified ? "verified" : "rejected"} successfully`,
        attendance,
      })
    } catch (error) {
      console.error("Error verifying attendance:", error)
      return res.status(500).json({
        success: false,
        message: "Error verifying attendance",
        error: error.message,
      })
    }
  }
}

module.exports = new AttendanceController()
