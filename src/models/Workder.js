const mongoose = require("mongoose")

const WorkOrderSchema = new mongoose.Schema({
    Discription: {
        type: String
    },
    Status: {
        type: String,
        enum: ['new', 'waiting', 'approved', 'rejected'],
        default: 'new'
    },
    Budget: {
        type: Number
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    UpatedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true }
)
const Workmodel = new mongoose.model ("Work"  , WorkOrderSchema)
module.exports = Workmodel