const { mongoose } = require("mongoose");

const conversationSchema = new mongoose.Schema({
    text: String,
    author: String,
    authorRole: {
        type: String,
        enum: ['client', 'siteManager', 'assistantManager', 'middleManagement', 'topManagement'],
        default: 'client'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Track if this response satisfied the client
    satisfactionResponse: {
        type: String,
        enum: ['pending', 'satisfied', 'not_satisfied'],
        default: 'pending'
    }
});

const ComplaintSchema = new mongoose.Schema(
    {
        store: {
            type: String,
            required: true,
            ref: 'Store'
        },
        subject: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        // Author can be a client or an employee
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        authorRole: {
            type: String,
            enum: ['client', 'siteManager', 'assistantManager', 'middleManagement', 'topManagement'],
            default: 'client'
        },
        status: {
            type: String,
            enum: ['new', 'in_progress', 'pending_client_feedback', 'escalated_to_assistant', 'escalated_to_manager', 'resolved', 'closed'],
            default: 'new'
        },
        mood: {
            type: String,
            enum: ['sad', 'happy', 'neutral'],
            default: 'neutral'
        },
        conversations: [conversationSchema],
        priority: {
            type: String,
            enum: ['low', 'medium', 'high',],
            default: 'medium'
        },
        category: {
            type: String,
            enum: ['Attendance', 'Technical', 'Service', 'Other'],
            required: true
        },
        // Current assignee level
        currentLevel: {
            type: String,
            enum: ['siteManager', 'assistantManager', 'middleManagement', 'topManagement'],
            default: 'siteManager'
        },
        // Specific person assigned 
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        // Track escalation timestamps
        escalationHistory: [{
            fromLevel: String,
            toLevel: String,
            reason: String, 
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        // For auto-escalation timing
        lastResponseAt: {
            type: Date,
            default: Date.now
        },
        // Overall client satisfaction with resolution
        resolutionSatisfaction: {
            type: String,
            enum: ['pending', 'satisfied', 'not_satisfied'],
            default: 'pending'
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Add pre-save middleware to update lastUpdated
ComplaintSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

const ComplaintModel = mongoose.model("Complaint", ComplaintSchema);
module.exports = ComplaintModel;