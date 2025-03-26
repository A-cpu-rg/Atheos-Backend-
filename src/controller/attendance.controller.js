const Attendance = require("../models/Attendance");
const Store = require("../models/Store");
const Employee = require("../models/Employee");
const Client = require("../models/Client");

class AttendanceController {
    async getAttendance(req, res) {
        try {
            const attendance = await Attendance.find()
                .populate("employeeId", "Name EmployeeId")
                .populate("store", "StoreName StoreCode")
                .sort({ date: -1 });

            const transformedAttendance = attendance.map(record => ({
                id: record._id,
                employeeId: record.employeeId?.EmployeeId || '',
                employeeName: record.employeeId?.Name || '',
                store: record.store?.StoreName || '',
                storeCode: record.store?.StoreCode || '',
                date: new Date(record.date).toLocaleDateString(),
                checkIn: record.checkIn || '-',
                checkOut: record.checkOut || '-',
                status: record.status,
                verifiedByClient: record.verifiedByClient,
                markedBy: record.markedBy,
                remarks: record.remarks
            }));

            res.json({
                success: true,
                attendance: transformedAttendance
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error fetching attendance records" });
        }
    }

    async markAttendance(req, res) {
        try {
            console.log("Marking attendance with data:", JSON.stringify(req.body));
            console.log("User role:", req.user?.Role);
            console.log("User info:", {
                id: req.user?._id,
                name: req.user?.Name,
                assignedStore: req.user?.AssignedStore
            });
            
            const { employeeId, store, storeCode, date, status, checkIn, checkOut, remarks, worker } = req.body;

            // Use worker field if employeeId is not provided (for backward compatibility)
            const finalEmployeeId = employeeId || worker;
            
            // Validate required fields
            if (!finalEmployeeId) {
                return res.status(400).json({ 
                    success: false,
                    message: "Employee ID is required" 
                });
            }
            
            // Use storeCode from the body, or get from the store name, or get from user's assigned store
            let finalStoreCode = storeCode;
            
            if (!finalStoreCode && store) {
                // Try to find store by name
                const storeObj = await Store.findOne({ 
                    $or: [
                        { StoreName: store },
                        { StoreCode: store }
                    ]
                });
                if (storeObj) {
                    finalStoreCode = storeObj.StoreCode;
                    console.log(`Found store code ${finalStoreCode} from store name ${store}`);
                }
            }
            
            if (!finalStoreCode && req.user?.AssignedStore) {
                finalStoreCode = req.user.AssignedStore;
                console.log(`Using user's assigned store: ${finalStoreCode}`);
            }
            
            // If still no store code, try to find the employee's assigned store
            if (!finalStoreCode) {
                const employee = await Employee.findById(finalEmployeeId);
                if (employee && employee.AssignedStore) {
                    finalStoreCode = employee.AssignedStore;
                    console.log(`Using employee's assigned store: ${finalStoreCode}`);
                }
            }
            
            if (!finalStoreCode) {
                return res.status(400).json({ 
                    success: false,
                    message: "Store code is required" 
                });
            }
            
            if (!date) {
                return res.status(400).json({ 
                    success: false,
                    message: "Date is required" 
                });
            }
            
            if (!status) {
                return res.status(400).json({ 
                    success: false,
                    message: "Status is required" 
                });
            }

            // Verify store exists with the final store code
            const storeObj = await Store.findOne({ 
                $or: [
                    { StoreCode: finalStoreCode },
                    { _id: finalStoreCode }
                ]
            });
            
            if (!storeObj) {
                return res.status(404).json({ 
                    success: false,
                    message: `Store not found with code: ${finalStoreCode}` 
                });
            }

            console.log(`Using store: ${storeObj.StoreName} (${storeObj.StoreCode})`);

            // Verify employee exists
            const employee = await Employee.findById(finalEmployeeId);
            if (!employee) {
                return res.status(404).json({ 
                    success: false,
                    message: "Employee not found" 
                });
            }

            console.log(`Marking attendance for employee: ${employee.Name} (${employee._id})`);

            // Check authorization - Site managers can only mark attendance for their assigned store
            const userRole = (req.user?.Role || '').toLowerCase();
            if (userRole === 'sitemanager' || userRole === 'site_manager') {
                // For site managers, check if they're assigned to this store
                const managerStore = req.user.AssignedStore;
                
                // Check various formats of store code matching
                const storeMatches = managerStore === storeObj.StoreCode || 
                                    managerStore === storeObj._id.toString();
                                    
                if (!storeMatches) {
                    console.log(`Site manager not authorized: manager store ${managerStore} doesn't match ${storeObj.StoreCode}`);
                    return res.status(403).json({
                        success: false,
                        message: "You are not authorized to mark attendance for this store"
                    });
                }
            }

            // Parse date string to date object
            const attendanceDate = new Date(date);
            attendanceDate.setHours(0, 0, 0, 0);
            
            // Check for existing attendance on this date
            const existingAttendance = await Attendance.findOne({
                employeeId: finalEmployeeId,
                date: {
                    $gte: attendanceDate,
                    $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
                }
            });

            if (existingAttendance) {
                console.log(`Attendance already exists for employee ${finalEmployeeId} on ${date}`);
                
                // Update existing attendance
                existingAttendance.status = status;
                if (checkIn) existingAttendance.checkIn = checkIn;
                if (checkOut) existingAttendance.checkOut = checkOut;
                if (remarks) existingAttendance.remarks = remarks;
                existingAttendance.markedBy = req.user?.Name || req.user?.name || 'System';
                
                await existingAttendance.save();
                
                const updated = await existingAttendance.populate([
                    { path: "employeeId", select: "Name EmployeeId" }
                ]);
                
                return res.status(200).json({
                    success: true,
                    message: "Attendance updated successfully",
                    attendance: updated
                });
            }

            // Create new attendance record with the final store code
            const attendance = new Attendance({
                employeeId: finalEmployeeId,
                store: storeObj.StoreCode, // Always use the store code, not ID
                date: attendanceDate,
                status,
                checkIn,
                checkOut,
                remarks,
                markedBy: req.user?.Name || req.user?.name || 'System'
            });
            
            console.log("Creating new attendance record:", {
                employeeId: finalEmployeeId,
                store: storeObj.StoreCode,
                date: attendanceDate,
                status,
                markedBy: req.user?.Name || req.user?.name || 'System'
            });
            
            await attendance.save();
            
            const populated = await attendance.populate([
                { path: "employeeId", select: "Name EmployeeId" }
            ]);

            return res.status(201).json({
                success: true,
                message: "Attendance marked successfully",
                attendance: populated
            });
        } catch (error) {
            console.error("Error marking attendance:", error);
            return res.status(500).json({ 
                success: false,
                message: "Error marking attendance",
                error: error.message 
            });
        }
    }

    async getAttendanceByDate(req, res) {
        try {
            console.log(`Getting attendance for date: ${req.params.date}`);
            console.log('User data:', {
                role: req.user?.Role, 
                name: req.user?.Name,
                storeCode: req.user?.AssignedStore
            });
            
            // Convert the date string to a Date object
            const dateStr = req.params.date;
            const startDate = new Date(dateStr);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(dateStr);
            endDate.setHours(23, 59, 59, 999);
            
            console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
            
            // Build query based on date range
            let query = {
                date: {
                    $gte: startDate,
                    $lt: endDate
                }
            };
            
            // Get user role, normalize to lowercase for consistent comparison
            const userRole = (req.user?.Role || '').toLowerCase();
            
            // Handle different methods of passing store code
            let storeCode = null;
            
            // 1. Check query parameters first
            if (req.query.store) {
                storeCode = req.query.store;
                console.log(`Using store code from query: ${storeCode}`);
            }
            // 2. Check headers next (for mobile client)
            else if (req.headers['x-store-code']) {
                storeCode = req.headers['x-store-code'];
                console.log(`Using store code from header: ${storeCode}`);
            }
            // 3. For assistant managers and site managers, use their assigned store
            else if (
                (userRole === 'assistantmanager' || userRole === 'assistant_manager' || 
                 userRole === 'sitemanager' || userRole === 'site_manager') && 
                req.user?.AssignedStore
            ) {
                storeCode = req.user.AssignedStore;
                console.log(`Using assigned store for ${userRole}: ${storeCode}`);
            }
            // 4. For clients, get from their stores array
            else if (userRole === 'client' && req.user?.Stores && req.user.Stores.length > 0) {
                // Handle array of store objects or array of store codes
                const storeFilter = req.user.Stores.map(store => 
                    typeof store === 'object' ? store.StoreCode : store
                );
                
                if (storeFilter.length === 1) {
                    // If client has only one store, use it directly
                    storeCode = storeFilter[0];
                    console.log(`Using single client store: ${storeCode}`);
                } else {
                    // If client has multiple stores, use $in operator
                    console.log(`Filtering by client stores: ${storeFilter.join(', ')}`);
                    query.store = { $in: storeFilter };
                }
            }
            
            // Add store code to query if determined and not already set
            if (storeCode && !query.store) {
                query.store = storeCode;
            }
            
            console.log('Final query:', JSON.stringify(query));
            
            // Find attendance records
            const attendance = await Attendance.find(query)
                .populate("employeeId", "Name EmployeeId Department ProfilePhoto")
                .sort({ date: -1 });

            console.log(`Found ${attendance.length} attendance records`);

            // Calculate stats from attendance records
            const stats = {
                total: attendance.length,
                present: attendance.filter(a => a.status === 'present').length,
                absent: attendance.filter(a => a.status === 'absent').length,
                halfDay: attendance.filter(a => a.status === 'halfDay').length
            };

            return res.status(200).json({
                success: true,
                stats,
                attendance
            });
        } catch (error) {
            console.error("Error fetching attendance by date:", error);
            return res.status(500).json({ 
                success: false,
                message: "Error fetching attendance records",
                error: error.message 
            });
        }
    }

    async getStoreAttendance(req, res) {
        try {
            const { storeId } = req.params;
            console.log(`Getting attendance for store: ${storeId}`);
            
            // Normalize store ID from various formats
            let normalizedStoreId = storeId;
            
            // If it looks like a store code format (e.g., A-O8WKNG), use directly
            // Otherwise, try to find the store by ID or code
            const store = await Store.findOne({ 
                $or: [
                    { _id: storeId },
                    { StoreCode: storeId }
                ]
            });
            
            if (!store) {
                console.log(`Store not found: ${storeId}`);
                return res.status(404).json({ 
                    success: false,
                    message: "Store not found" 
                });
            }
            
            // Use store code for consistency
            normalizedStoreId = store.StoreCode;
            console.log(`Using normalized store code: ${normalizedStoreId}`);
            
            // Get the user's role and check permission
            const userRole = (req.user?.Role || '').toLowerCase();
            let isAuthorized = true; // Default to true for most roles
            
            // For site managers and assistant managers, verify store assignment
            if (userRole === 'sitemanager' || userRole === 'site_manager' || 
                userRole === 'assistantmanager' || userRole === 'assistant_manager') {
                
                console.log(`Checking if ${userRole} is assigned to store ${normalizedStoreId}`);
                console.log(`User's assigned store: ${req.user?.AssignedStore}`);
                
                // Check if user is assigned to this store
                isAuthorized = req.user?.AssignedStore === normalizedStoreId;
            }
            // For clients, check store list
            else if (userRole === 'client') {
                const storeIds = req.user.Stores || [];
                const storeFilter = storeIds.map(s => 
                    typeof s === 'object' ? s.StoreCode : s
                );
                
                isAuthorized = storeFilter.includes(normalizedStoreId);
                console.log(`Client store check for ${normalizedStoreId}: ${isAuthorized}`);
            }
            
            if (!isAuthorized) {
                console.log(`User not authorized for store: ${normalizedStoreId}`);
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to access this store's attendance"
                });
            }
            
            // Find attendance records using the normalized store code
            const attendance = await Attendance.find({ 
                store: normalizedStoreId
            })
                .populate("employeeId", "Name EmployeeId Department ProfilePhoto")
                .sort({ date: -1 });
                
            console.log(`Found ${attendance.length} attendance records for store ${normalizedStoreId}`);

            const stats = {
                total: attendance.length,
                present: attendance.filter(a => a.status === 'present').length,
                absent: attendance.filter(a => a.status === 'absent').length,
                halfDay: attendance.filter(a => a.status === 'halfDay').length
            };

            return res.status(200).json({
                success: true,
                stats,
                storeName: store.StoreName,
                storeCode: store.StoreCode,
                attendance
            });
        } catch (error) {
            console.error("Error fetching store attendance:", error);
            return res.status(500).json({ 
                success: false,
                message: "Error fetching store attendance",
                error: error.message 
            });
        }
    }

    async getAttendanceStats(req, res) {
        try {
            const { startDate, endDate, storeCode } = req.query;

            const query = {};
            if (startDate && endDate) {
                query.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (storeCode) {
                query.store = storeCode;
            }

            const attendance = await Attendance.find(query);
            const totalEmployees = await Employee.countDocuments({ Status: 'Active' });

            const stats = {
                totalEmployees,
                present: attendance.filter(a => a.status === 'present').length,
                absent: attendance.filter(a => a.status === 'absent').length,
                halfDay: attendance.filter(a => a.status === 'halfDay').length
            };

            res.json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({ message: "Error fetching attendance statistics" });
        }
    }

    async updateAttendance(req, res) {
        try {
            const { id } = req.params;
            const { checkIn, checkOut, status, remarks } = req.body;

            const attendance = await Attendance.findByIdAndUpdate(
                id,
                {
                    checkIn,
                    checkOut,
                    status,
                    remarks,
                    markedBy: req.user?.name || 'System'
                },
                { new: true }
            ).populate("employeeId", "Name EmployeeId")
             .populate("store", "StoreName StoreCode");

            if (!attendance) {
                return res.status(404).json({ message: "Attendance record not found" });
            }

            res.json({
                success: true,
                attendance
            });
        } catch (error) {
            res.status(500).json({ message: "Error updating attendance" });
        }
    }

    async verifyAttendance(req, res) {
        try {
            console.log('Verifying attendance:', req.params.id);
            const { id } = req.params;
            const { verified, remarks, clientId, storeCode } = req.body;

            console.log('Verification details:', { 
                verified, remarks, clientId, storeCode,
                userRole: req.user?.Role
            });

            // Find the attendance record
            const attendance = await Attendance.findById(id);
            if (!attendance) {
                console.log('Attendance record not found');
                return res.status(404).json({ 
                    success: false,
                    message: "Attendance record not found" 
                });
            }

            // Check if client is associated with the store
            let isAuthorized = false;
            
            // Check user role - must be a client
            if (req.user && req.user.Role && req.user.Role.toLowerCase() === 'client') {
                console.log('Client role verified');
                
                // Check if client stores include this attendance store
                if (req.user.Stores && req.user.Stores.length > 0) {
                    const storeFilter = req.user.Stores.map(store => 
                        typeof store === 'object' ? store.StoreCode : store
                    );
                    
                    isAuthorized = storeFilter.includes(attendance.store);
                    console.log(`Client store check: ${isAuthorized}`);
                }
            }

            if (!isAuthorized) {
                console.log('Client not authorized to verify this attendance');
                return res.status(403).json({ 
                    success: false,
                    message: "You are not authorized to verify attendance for this store" 
                });
            }

            // Update the attendance record
            attendance.verifiedByClient = verified;
            attendance.verifiedAt = new Date();
            
            // Add verification remarks if provided
            if (remarks) {
                attendance.remarks = attendance.remarks ? 
                    `${attendance.remarks}\nVerification note: ${remarks}` : 
                    `Verification note: ${remarks}`;
            }

            await attendance.save();
            console.log('Attendance verification saved successfully');

            return res.status(200).json({
                success: true,
                message: `Attendance ${verified ? 'verified' : 'rejected'} successfully`,
                attendance
            });
        } catch (error) {
            console.error("Error verifying attendance:", error);
            return res.status(500).json({ 
                success: false,
                message: "Error verifying attendance",
                error: error.message 
            });
        }
    }
}

module.exports = new AttendanceController();