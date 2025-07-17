// const mongoose = require("mongoose");

// const AttendanceSchema = new mongoose.Schema({
//     employeeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Employee',
//         required: true
//     },
//     store: {
//         type: String,  // StoreCode
//         ref: 'Store',
//         required: true
//     },
//     date: {
//         type: Date,
//         required: true,
//         default: Date.now
//     },
//     checkIn: {
//         type: String,
//         default: null
//     },
//     checkOut: {
//         type: String,
//         default: null
//     },
//     status: {
//         type: String,
//         enum: ['present', 'absent', 'halfDay'],
//         required: true
//     },
//     verifiedByClient: {
//         type: Boolean,
//         default: false
//     },
//     verifiedAt: {
//         type: Date
//     },
//     markedBy: {
//         type: String,
//         // required: true
//     },
//     remarks: {
//         type: String,
//         default: ''
//     }
// }, { timestamps: true });

// // Remove old problematic index
// AttendanceSchema.index({ worker: 1, date: 1 }, { unique: false, sparse: true });

// // Create a more reliable unique index
// AttendanceSchema.index({ 
//     employeeId: 1, 
//     'date.year': 1, 
//     'date.month': 1, 
//     'date.day': 1 
// }, { 
//     unique: true,
//     partialFilterExpression: { employeeId: { $exists: true } }
// });

// // Pre-save hook to normalize date to beginning of day 
// // and extract year, month, day for better indexing
// AttendanceSchema.pre('save', function(next) {
//     if (this.date) {
//         // Extract date components for better indexing
//         const d = new Date(this.date);
//         // Create a date string in YYYY-MM-DD format
//         const dateStr = d.toISOString().split('T')[0];
        
//         // Parse the date string to avoid timezone issues
//         const [year, month, day] = dateStr.split('-').map(Number);
        
//         // Create a new date with just the date part (year, month, day)
//         // Note: month is 0-indexed in JavaScript
//         const normalizedDate = new Date(year, month-1, day, 0, 0, 0, 0);
        
//         this.date = normalizedDate;
        
//         // Add date components for better querying
//         this.set('date.year', year);
//         this.set('date.month', month);
//         this.set('date.day', day);
//     }
//     next();
// });

// module.exports = mongoose.model("Attendance", AttendanceSchema);




// const mongoose = require("mongoose");

// const AttendanceSchema = new mongoose.Schema({
//     employeeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Employee',
//         required: true
//     },
//     store: [{
//         type: String,  // StoreCode
//         ref: 'Store',
//         // required: true
//     }],
//     date: {
//         type: Date,
//         required: true,
//         default: Date.now
//     },
//     checkIn: {
//         type: String,  // Format: "HH:MM" (24-hour)
//         default: null
//     },
//     checkOut: {
//         type: String,  // Format: "HH:MM" (24-hour)
//         default: null
//     },
//     status: {
//         type: String,
//         enum: ['present', 'absent', 'halfDay'],
//         required: true
//     },
//     verifiedByClient: {
//         type: Boolean,
//         default: false
//     },
//     verifiedAt: {
//         type: Date
//     },
//     markedBy: {
//         type: String,
//     },
//     remarks: {
//         type: String,
//         default: ''
//     },
//     breaks: [{
//         startTime: { type: String },  // Format: "HH:MM"
//         endTime: { type: String },   // Format: "HH:MM"
//         duration: { type: Number }   // in minutes
//     }],
//     totalBreakTime: {
//         type: Number, // in minutes
//         default: 0,
//         max: 60 // Maximum 1 hour (60 minutes)
//     },
//     totalWorkingTime: {
//         type: Number, // in minutes
//         default: 0
//     }
// }, { timestamps: true });

// // Indexes remain the same...

// // Remove old problematic index
// AttendanceSchema.index({ worker: 1, date: 1 }, { unique: false, sparse: true });

// // Create a more reliable unique index
// AttendanceSchema.index(
//   {
//     employeeId: 1,
//     'date.year': 1,
//     'date.month': 1,
//     'date.day': 1
//   },
//   {
//     unique: true,
//     partialFilterExpression: {
//       employeeId: { $exists: true },
//       'date.year': { $exists: true, $ne: null },
//       'date.month': { $exists: true, $ne: null },
//       'date.day': { $exists: true, $ne: null }
//     }
//   }
// );


// // Pre-save hook with enhanced calculations
// AttendanceSchema.pre('save', function(next) {
//     // Date normalization (same as before)
//     if (this.date) {
//         const d = new Date(this.date);
//         const dateStr = d.toISOString().split('T')[0];
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const normalizedDate = new Date(year, month-1, day, 0, 0, 0, 0);
//         this.date = normalizedDate;
//         this.set('date.year', year);
//         this.set('date.month', month);
//         this.set('date.day', day);
//     }

//     // Break calculations
//     if (this.isModified('breaks')) {
//         this.totalBreakTime = this.breaks.reduce((total, brk) => total + brk.duration, 0);
        
//         if (this.totalBreakTime > 60) {
//             throw new Error('Total break time cannot exceed 60 minutes');
//         }
        
//         const validDurations = [15, 30, 60];
//         const invalidBreaks = this.breaks.filter(brk => !validDurations.includes(brk.duration));
//         if (invalidBreaks.length > 0) {
//             throw new Error('Break durations must be 15, 30, or 60 minutes');
//         }
//     }

//     // Calculate total working time whenever checkIn, checkOut, or breaks change
//     if (this.isModified(['checkIn', 'checkOut', 'breaks']) && this.checkIn && this.checkOut) {
//         const checkInTime = this.parseTimeString(this.checkIn);
//         const checkOutTime = this.parseTimeString(this.checkOut);
        
//         // Calculate total minutes between checkOut and checkIn
//         let totalMinutes = (checkOutTime.hours * 60 + checkOutTime.minutes) - 
//                           (checkInTime.hours * 60 + checkInTime.minutes);
        
//         // Subtract break time
//         this.totalWorkingTime = totalMinutes - this.totalBreakTime;
        
//         // Ensure working time isn't negative (just in case)
//         if (this.totalWorkingTime < 0) {
//             this.totalWorkingTime = 0;
//         }
//     }

//     next();
// });

// // Helper method to parse "HH:MM" strings
// AttendanceSchema.methods.parseTimeString = function(timeStr) {
//     if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) {
//         throw new Error('Invalid time format. Use "HH:MM"');
//     }
//     const [hours, minutes] = timeStr.split(':').map(Number);
//     if (hours > 23 || minutes > 59) {
//         throw new Error('Invalid time value');
//     }
//     return { hours, minutes };
// };

// // Add a break (updated to trigger working time calculation)
// AttendanceSchema.methods.addBreak = function(startTime, endTime, duration) {
//     const validDurations = [15, 30, 60];
//     if (!validDurations.includes(duration)) {
//         throw new Error('Break duration must be 15, 30, or 60 minutes');
//     }
    
//     if (this.totalBreakTime + duration > 60) {
//         throw new Error('Adding this break would exceed the 60-minute limit');
//     }
    
//     this.breaks.push({ startTime, endTime, duration });
//     this.totalBreakTime += duration;
    
//     // Recalculate working time
//     if (this.checkIn && this.checkOut) {
//         this.totalWorkingTime = this.calculateWorkingTime();
//     }
// };

// // Method to calculate working time
// AttendanceSchema.methods.calculateWorkingTime = function() {
//     if (!this.checkIn || !this.checkOut) return 0;
    
//     const checkIn = this.parseTimeString(this.checkIn);
//     const checkOut = this.parseTimeString(this.checkOut);
    
//     const totalMinutes = (checkOut.hours * 60 + checkOut.minutes) - 
//                          (checkIn.hours * 60 + checkIn.minutes);
    
//     return Math.max(0, totalMinutes - this.totalBreakTime);
// };

// module.exports = mongoose.model("Attendance", AttendanceSchema);









const mongoose = require("mongoose")

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    // Corrected: 'store' should be an ObjectId reference, not an array of strings
    store: {
      type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
      ref: "Store",
      required: true, // Assuming an attendance record must belong to a store
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkIn: {
      type: String, // Format: "HH:MM" (24-hour)
      default: null,
    },
    checkOut: {
      type: String, // Format: "HH:MM" (24-hour)
      default: null,
    },
    status: {
      type: String,
      enum: ["present", "absent", "halfDay"],
      required: true,
    },
    verifiedByClient: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    markedBy: {
      type: String,
    },
    remarks: {
      type: String,
      default: "",
    },
    breaks: [
      {
        startTime: { type: String }, // Format: "HH:MM"
        endTime: { type: String }, // Format: "HH:MM"
        duration: { type: Number }, // in minutes
      },
    ],
    totalBreakTime: {
      type: Number, // in minutes
      default: 0,
      max: 60, // Maximum 1 hour (60 minutes)
    },
    totalWorkingTime: {
      type: Number, // in minutes
      default: 0,
    },
  },
  { timestamps: true },
)

// Remove old problematic index
AttendanceSchema.index({ worker: 1, date: 1 }, { unique: false, sparse: true })

// Create a more reliable unique index
AttendanceSchema.index(
  {
    employeeId: 1,
    "date.year": 1,
    "date.month": 1,
    "date.day": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      employeeId: { $exists: true },
      "date.year": { $exists: true, $ne: null },
      "date.month": { $exists: true, $ne: null },
      "date.day": { $exists: true, $ne: null },
    },
  },
)

// Pre-save hook with enhanced calculations
AttendanceSchema.pre("save", function (next) {
  // Date normalization (same as before)
  if (this.date) {
    const d = new Date(this.date)
    const dateStr = d.toISOString().split("T")[0]
    const [year, month, day] = dateStr.split("-").map(Number)
    const normalizedDate = new Date(year, month - 1, day, 0, 0, 0, 0)
    this.date = normalizedDate
    this.set("date.year", year)
    this.set("date.month", month)
    this.set("date.day", day)
  }
  // Break calculations
  if (this.isModified("breaks")) {
    this.totalBreakTime = this.breaks.reduce((total, brk) => total + brk.duration, 0)

    if (this.totalBreakTime > 60) {
      throw new Error("Total break time cannot exceed 60 minutes")
    }

    const validDurations = [15, 30, 60]
    const invalidBreaks = this.breaks.filter((brk) => !validDurations.includes(brk.duration))
    if (invalidBreaks.length > 0) {
      throw new Error("Break durations must be 15, 30, or 60 minutes")
    }
  }
  // Calculate total working time whenever checkIn, checkOut, or breaks change
  if (this.isModified(["checkIn", "checkOut", "breaks"]) && this.checkIn && this.checkOut) {
    const checkInTime = this.parseTimeString(this.checkIn)
    const checkOutTime = this.parseTimeString(this.checkOut)

    // Calculate total minutes between checkOut and checkIn
    const totalMinutes = checkOutTime.hours * 60 + checkOutTime.minutes - (checkInTime.hours * 60 + checkInTime.minutes)

    // Subtract break time
    this.totalWorkingTime = totalMinutes - this.totalBreakTime

    // Ensure working time isn't negative (just in case)
    if (this.totalWorkingTime < 0) {
      this.totalWorkingTime = 0
    }
  }
  next()
})

// Helper method to parse "HH:MM" strings
AttendanceSchema.methods.parseTimeString = (timeStr) => {
  if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) {
    throw new Error('Invalid time format. Use "HH:MM"')
  }
  const [hours, minutes] = timeStr.split(":").map(Number)
  if (hours > 23 || minutes > 59) {
    throw new Error("Invalid time value")
  }
  return { hours, minutes }
}

// Add a break (updated to trigger working time calculation)
AttendanceSchema.methods.addBreak = function (startTime, endTime, duration) {
  const validDurations = [15, 30, 60]
  if (!validDurations.includes(duration)) {
    throw new Error("Break duration must be 15, 30, or 60 minutes")
  }

  if (this.totalBreakTime + duration > 60) {
    throw new Error("Adding this break would exceed the 60-minute limit")
  }

  this.breaks.push({ startTime, endTime, duration })
  this.totalBreakTime += duration

  // Recalculate working time
  if (this.checkIn && this.checkOut) {
    this.totalWorkingTime = this.calculateWorkingTime()
  }
}

// Method to calculate working time
AttendanceSchema.methods.calculateWorkingTime = function () {
  if (!this.checkIn || !this.checkOut) return 0

  const checkIn = this.parseTimeString(this.checkIn)
  const checkOut = this.parseTimeString(this.checkOut)

  const totalMinutes = checkOut.hours * 60 + checkOut.minutes - (checkIn.hours * 60 + checkIn.minutes)

  return Math.max(0, totalMinutes - this.totalBreakTime)
}

module.exports = mongoose.model("Attendance", AttendanceSchema)
