const { mongoose } = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'App'
        },
        text: {
            type: String
        },
        author: {
            type: String
        },
        authorRole: {
            type: String,
            enum: ['Client', 'Supervisor', 'Admin'],
            default: 'Client'
        },
        status: {
            type: String,
            enum: ['new', 'priority', 'solved'],
            default: 'new'
        },
        mood: {
            type: String,
            enum: ['sad', 'happy']
        },
        conversations: [{
            text: String,
            author: String,
            authorRole: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        priority: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            enum: ['Attendance', 'Technical', 'Service', 'Other']
        },
        assignedTo: {
            type: String
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

const ComplaintModel = mongoose.model("Complaint", ComplaintSchema);
module.exports = ComplaintModel;