const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    store: {
        type: String,  // StoreCode
        ref: 'Store',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkIn: {
        type: String,
        default: null
    },
    checkOut: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'halfDay'],
        required: true
    },
    verifiedByClient: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    markedBy: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);