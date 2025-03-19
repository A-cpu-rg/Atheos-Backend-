const mongoose = require("mongoose")

const WorkOrderSchema = new mongoose.Schema({
    Discription: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        enum: ['new', 'waiting', 'approved', 'rejected', 'completed'],
        default: 'new'
    },
    Budget: {
        type: Number,
        required: true
    },
    // Add client reference - this is who raised the work order
    clientId: {
        type: String,
        required: true,
        ref: 'Client'
    },
    // Add store reference - where the work is to be performed
    storeId: {
        type: String,
        required: true,
        ref: 'Store'
    },
    // Person assigned to complete the work
    assignedTo: {
        type: String,
        ref: 'Employee',
        default: null
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    UpatedAt: {
        type: Date,
        default: Date.now
    },
    // Add comments field for tracking progress
    comments: [{
        text: String,
        author: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true }
)
const Workmodel = new mongoose.model("Work", WorkOrderSchema)
module.exports = Workmodel