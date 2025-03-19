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
            const { employeeId, storeCode, date, status, checkIn, checkOut, remarks } = req.body;

            const store = await Store.findOne({ StoreCode: storeCode });
            if (!store) {
                return res.status(404).json({ message: "Store not found" });
            }

            const employee = await Employee.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }

            const existingAttendance = await Attendance.findOne({
                employeeId,
                date: new Date(date).toISOString().split('T')[0]
            });

            if (existingAttendance) {
                return res.status(400).json({ message: "Attendance already marked for this date" });
            }

            const attendance = await Attendance.create({
                employeeId,
                store: storeCode,
                date,
                status,
                checkIn,
                checkOut,
                remarks,
                markedBy: req.user?.name || 'System'
            });

            const populatedAttendance = await attendance.populate([
                { path: "employeeId", select: "Name EmployeeId" },
                { path: "store", select: "StoreName StoreCode" }
            ]);

            res.status(201).json({
                success: true,
                attendance: populatedAttendance
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error marking attendance" });
        }
    }

    async getAttendanceByDate(req, res) {
        try {
            const date = new Date(req.params.date);
            const attendance = await Attendance.find({
                date: {
                    $gte: new Date(date.setHours(0, 0, 0)),
                    $lt: new Date(date.setHours(23, 59, 59)),
                },
            })
                .populate("employeeId", "Name EmployeeId")
                .populate("store", "StoreName StoreCode")
                .sort({ date: -1 });

            const stats = {
                total: attendance.length,
                present: attendance.filter(a => a.status === 'present').length,
                absent: attendance.filter(a => a.status === 'absent').length,
                halfDay: attendance.filter(a => a.status === 'halfDay').length
            };

            res.json({
                success: true,
                stats,
                attendance
            });
        } catch (error) {
            res.status(500).json({ message: "Error fetching attendance records" });
        }
    }

    async getStoreAttendance(req, res) {
        try {
            const { storeId } = req.params;
            
            const store = await Store.findOne({ StoreCode: storeId });
            if (!store) {
                return res.status(404).json({ message: "Store not found" });
            }

            const attendance = await Attendance.find({ store: storeId })
                .populate("employeeId", "Name EmployeeId")
                .populate("store", "StoreName StoreCode")
                .sort({ date: -1 });

            const stats = {
                total: attendance.length,
                present: attendance.filter(a => a.status === 'present').length,
                absent: attendance.filter(a => a.status === 'absent').length,
                halfDay: attendance.filter(a => a.status === 'halfDay').length
            };

            res.json({
                success: true,
                stats,
                storeName: store.StoreName,
                attendance
            });
        } catch (error) {
            res.status(500).json({ message: "Error fetching store attendance" });
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
            const { id } = req.params;
            const { verified, remarks } = req.body;

            // Ensure the user is a client
            if (req.user.role !== 'client') {
                return res.status(403).json({ 
                    success: false,
                    message: "Only clients can verify attendance" 
                });
            }

            // Find the attendance record
            const attendance = await Attendance.findById(id);
            if (!attendance) {
                return res.status(404).json({ 
                    success: false,
                    message: "Attendance record not found" 
                });
            }

            // Check if client is associated with the store
            const client = await Client.findById(req.user._id);
            if (!client || !client.Stores.includes(attendance.store)) {
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

            res.status(200).json({
                success: true,
                message: `Attendance ${verified ? 'verified' : 'rejected'} successfully`,
                attendance
            });
        } catch (error) {
            console.error("Error verifying attendance:", error);
            res.status(500).json({ 
                success: false,
                message: "Error verifying attendance" 
            });
        }
    }
}

module.exports = new AttendanceController();