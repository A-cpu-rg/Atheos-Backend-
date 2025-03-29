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

// Remove old problematic index
AttendanceSchema.index({ worker: 1, date: 1 }, { unique: false, sparse: true });

// Create a more reliable unique index
AttendanceSchema.index({ 
    employeeId: 1, 
    'date.year': 1, 
    'date.month': 1, 
    'date.day': 1 
}, { 
    unique: true,
    partialFilterExpression: { employeeId: { $exists: true } }
});

// Pre-save hook to normalize date to beginning of day 
// and extract year, month, day for better indexing
AttendanceSchema.pre('save', function(next) {
    if (this.date) {
        // Extract date components for better indexing
        const d = new Date(this.date);
        // Create a date string in YYYY-MM-DD format
        const dateStr = d.toISOString().split('T')[0];
        
        // Parse the date string to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        
        // Create a new date with just the date part (year, month, day)
        // Note: month is 0-indexed in JavaScript
        const normalizedDate = new Date(year, month-1, day, 0, 0, 0, 0);
        
        this.date = normalizedDate;
        
        // Add date components for better querying
        this.set('date.year', year);
        this.set('date.month', month);
        this.set('date.day', day);
    }
    next();
});

module.exports = mongoose.model("Attendance", AttendanceSchema);