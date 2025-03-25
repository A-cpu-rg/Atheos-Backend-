const ComplaintModel = require("../models/Complaint");
const Employee = require("../models/Employee");
const Store = require("../models/Store");

class Complaint {
    // Get all complaints
    async getComplaint(req, res) {
        try {
            // Remove role-based filtering - show all complaints to everyone
            const query = {};
            
            console.log('User Role:', req.user.Role);
            console.log('Query:', JSON.stringify(query));
            
            const complaints = await ComplaintModel.find(query)
                .sort({ createdAt: -1 });

            console.log('Found complaints:', complaints.length);

            if (complaints) {
                // Transform data for web interface with names and IDs
                const transformedComplaints = complaints.map(complaint => ({
                    _id: complaint._id,
                    Store: complaint.store,
                    subject: complaint.subject || complaint.text.substring(0, 30) + "...",
                    description: complaint.text,
                    status: complaint.status,
                    priority: complaint.priority,
                    category: complaint.category,
                    currentLevel: complaint.currentLevel,
                    createdBy: complaint.author,
                    createdAt: new Date(complaint.createdAt).toLocaleString(),
                    lastResponseAt: new Date(complaint.lastResponseAt).toLocaleString(),
                    responses: complaint.conversations.map(conv => ({
                        message: conv.text,
                        user: conv.author,
                        timestamp: new Date(conv.createdAt).toLocaleString(),
                        role: conv.authorRole,
                        satisfactionResponse: conv.satisfactionResponse
                    })),
                    resolutionSatisfaction: complaint.resolutionSatisfaction,
                    mood: complaint.mood,
                    assignedTo: complaint.assignedTo || 'Unassigned',
                    key: complaint._id.toString()
                }));

                return res.status(200).json({
                    success: true,
                    complaints: transformedComplaints,
                    COM: complaints
                });
            } else {
                return res.status(400).json({ error: "No complaints found" });
            }
        } catch (error) {
            console.error("Error fetching complaints:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Add new complaint - primarily used by clients
    async addComplaint(req, res) {
        try {
            const {
                store,
                subject,
                text,
                category,
                mood
            } = req.body;

            // Validate required fields
            if (!store || !text) {
                return res.status(400).json({ 
                    error: "Missing required fields: store and text are required" 
                });
            }

            // Verify store exists
            const storeExists = await Store.findOne({ StoreCode: store });
            if (!storeExists) {
                return res.status(404).json({ error: "Store not found" });
            }

            // Get user info from request
            const author = req.user.Name || 'Anonymous';
            const authorId = req.user._id;
            const authorRole = req.user.Role || 'Client';

            // Initial conversation entry
            const initialConversation = {
                text,
                author,
                authorRole,
                createdAt: new Date()
            };

            // Find the site manager for this store to assign
            let assignedTo = null;
            const siteManager = await Employee.findOne({ 
                AssignedStore: store,
                Role: 'siteManager',
                Status: 'Active'
            });
            
            if (siteManager) {
                assignedTo = siteManager._id;
            }

            const newComplaint = await ComplaintModel.create({
                store,
                subject: subject || text.substring(0, 50) + "...", // Create subject from text if not provided
                text,
                author,
                authorId,
                authorRole,
                status: 'new',
                mood: mood || 'neutral',
                conversations: [initialConversation],
                priority: 'medium',
                category: category || 'Other',
                currentLevel: 'siteManager',
                assignedTo,
                lastResponseAt: new Date()
            });

            if (newComplaint) {
                // Transform the response to include ID and use names
                const transformedComplaint = {
                    _id: newComplaint._id,
                    Store: newComplaint.store,
                    subject: newComplaint.subject,
                    description: newComplaint.text,
                    status: newComplaint.status,
                    priority: newComplaint.priority,
                    createdBy: newComplaint.author,
                    createdAt: new Date(newComplaint.createdAt).toLocaleString(),
                    category: newComplaint.category,
                    mood: newComplaint.mood,
                    currentLevel: newComplaint.currentLevel,
                    assignedTo: newComplaint.assignedTo || 'Unassigned',
                    key: newComplaint._id.toString()
                };

                return res.status(201).json({
                    success: true,
                    message: "Complaint created successfully",
                    complaint: transformedComplaint
                });
            } else {
                return res.status(400).json({ error: "Failed to create complaint" });
            }
        } catch (error) {
            console.error("Add Complaint Error:", error);
            return res.status(500).json({ error: "Internal server error",message:error.message });
        }
    }

    // Add response to complaint
    async addResponse(req, res) {
        try {
            const { id } = req.params;
            const { text, status } = req.body;

            // Validate ID and required fields
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: "Invalid complaint ID" });
            }

            if (!text) {
                return res.status(400).json({ error: "Response text is required" });
            }

            // Get complaint to check current state
            const complaint = await ComplaintModel.findById(id);
            if (!complaint) {
                return res.status(404).json({ error: "Complaint not found" });
            }

            // Get user info from request
            const author = req.user.Name || 'Anonymous';
            const authorRole = req.user.Role || 'siteManager';

            // Create response object
            const response = {
                text,
                author,
                authorRole,
                createdAt: new Date(),
                satisfactionResponse: 'pending'
            };

            // Update status based on who is responding
            let newStatus = status || complaint.status;
            
            // If employee is responding to client
            if (authorRole !== 'Client' && complaint.authorRole === 'Client') {
                newStatus = 'pending_client_feedback';
            }
            // If client is responding to previous response
            else if (authorRole === 'Client' && complaint.status === 'pending_client_feedback') {
                newStatus = 'in_progress';
            }

            // Update the complaint with the new response
            const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
                id,
                {
                    $push: { conversations: response },
                    status: newStatus,
                    lastResponseAt: new Date(),
                    lastUpdated: new Date()
                },
                { new: true }
            );

            if (updatedComplaint) {
                // Transform the response
                const transformedResponse = {
                    _id: updatedComplaint._id,
                    message: text,
                    user: author,
                    timestamp: new Date().toLocaleString(),
                    role: authorRole,
                    status: updatedComplaint.status,
                    satisfactionResponse: 'pending'
                };

                return res.status(200).json({
                    success: true,
                    message: "Response added successfully",
                    response: transformedResponse,
                    complaint: {
                        _id: updatedComplaint._id,
                        Store: updatedComplaint.store,
                        status: updatedComplaint.status,
                        responses: updatedComplaint.conversations.map(conv => ({
                            message: conv.text,
                            user: conv.author,
                            timestamp: new Date(conv.createdAt).toLocaleString(),
                            role: conv.authorRole,
                            satisfactionResponse: conv.satisfactionResponse
                        }))
                    }
                });
            } else {
                return res.status(404).json({ error: "Complaint not found" });
            }
        } catch (error) {
            console.error("Add Response Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Client satisfaction response (Yes/No to solution)
    async respondToSolution(req, res) {
        try {
            const { id, responseId } = req.params;
            const { satisfied } = req.body;

            // Validate parameters
            if (!id || !responseId) {
                return res.status(400).json({ error: "Complaint ID and response ID are required" });
            }

            if (satisfied === undefined) {
                return res.status(400).json({ error: "Satisfaction status is required" });
            }

            // Find the complaint
            const complaint = await ComplaintModel.findById(id);
            if (!complaint) {
                return res.status(404).json({ error: "Complaint not found" });
            }

            // Find the specific response in conversations
            const responseIndex = complaint.conversations.findIndex(
                conv => conv._id.toString() === responseId
            );

            if (responseIndex === -1) {
                return res.status(404).json({ error: "Response not found" });
            }

            // Update the satisfaction status
            complaint.conversations[responseIndex].satisfactionResponse = 
                satisfied ? 'satisfied' : 'not_satisfied';

            // If satisfied, update complaint status to resolved
            if (satisfied) {
                complaint.status = 'resolved';
                complaint.resolutionSatisfaction = 'satisfied';
            } else {
                // If not satisfied, check escalation
                const now = new Date();
                const responseTime = now - new Date(complaint.lastResponseAt);
                
                // Check if we need to escalate based on current level
                if (complaint.currentLevel === 'siteManager') {
                    // Escalate to assistant manager after 12 hours
                    complaint.currentLevel = 'assistantManager';
                    complaint.status = 'escalated_to_assistant';
                    
                    // Add to escalation history
                    complaint.escalationHistory.push({
                        fromLevel: 'siteManager',
                        toLevel: 'assistantManager',
                        reason: 'Client not satisfied with site manager resolution',
                        timestamp: now
                    });
                    
                    // Find assistant manager to assign
                    const assistantManager = await Employee.findOne({
                        Role: 'assistantManager',
                        Status: 'Active'
                    });
                    
                    if (assistantManager) {
                        complaint.assignedTo = assistantManager._id;
                    }
                } 
                else if (complaint.currentLevel === 'assistantManager') {
                    // Escalate to middle management
                    complaint.currentLevel = 'middleManagement';
                    complaint.status = 'escalated_to_manager';
                    complaint.priority = 'high';
                    
                    // Add to escalation history
                    complaint.escalationHistory.push({
                        fromLevel: 'assistantManager',
                        toLevel: 'middleManagement',
                        reason: 'Client not satisfied with assistant manager resolution',
                        timestamp: now
                    });
                    
                    // Reset assignedTo - will be picked up by middle management
                    complaint.assignedTo = null;
                }
            }

            // Save the updated complaint
            await complaint.save();

            return res.status(200).json({
                success: true,
                message: satisfied ? 
                    "Solution marked as satisfactory" : 
                    "Solution marked as unsatisfactory and escalated",
                complaint: {
                    _id: complaint._id,
                    status: complaint.status,
                    currentLevel: complaint.currentLevel,
                    resolutionSatisfaction: complaint.resolutionSatisfaction
                }
            });
        } catch (error) {
            console.error("Response Satisfaction Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Check and escalate complaints based on response time
    async checkAndEscalateComplaints(req, res) {
        try {
            const now = new Date();
            
            // Find complaints that need escalation based on time since last response
            const complaints = await ComplaintModel.find({
                status: { $nin: ['resolved', 'closed'] }
            });
            
            let escalatedCount = 0;
            
            for (const complaint of complaints) {
                const lastResponseTime = now - new Date(complaint.lastResponseAt);
                const hoursSinceLastResponse = lastResponseTime / (1000 * 60 * 60);
                
                // Escalate based on current level and time
                if (complaint.currentLevel === 'siteManager' && hoursSinceLastResponse >= 12) {
                    // Escalate to assistant manager after 12 hours
                    complaint.currentLevel = 'assistantManager';
                    complaint.status = 'escalated_to_assistant';
                    
                    // Add to escalation history
                    complaint.escalationHistory.push({
                        fromLevel: 'siteManager',
                        toLevel: 'assistantManager',
                        reason: 'Auto-escalated: No response within 12 hours',
                        timestamp: now
                    });
                    
                    // Find assistant manager to assign
                    const assistantManager = await Employee.findOne({
                        Role: 'assistantManager',
                        Status: 'Active'
                    });
                    
                    if (assistantManager) {
                        complaint.assignedTo = assistantManager._id;
                    }
                    
                    await complaint.save();
                    escalatedCount++;
                } 
                else if (complaint.currentLevel === 'assistantManager' && hoursSinceLastResponse >= 24) {
                    // Escalate to middle management after 24 hours
                    complaint.currentLevel = 'middleManagement';
                    complaint.status = 'escalated_to_manager';
                    complaint.priority = 'high';
                    
                    // Add to escalation history
                    complaint.escalationHistory.push({
                        fromLevel: 'assistantManager',
                        toLevel: 'middleManagement',
                        reason: 'Auto-escalated: No response within 24 hours',
                        timestamp: now
                    });
                    
                    // Reset assignedTo - will be picked up by middle management
                    complaint.assignedTo = null;
                    
                    await complaint.save();
                    escalatedCount++;
                }
            }
            
            return res.status(200).json({
                success: true,
                message: `Checked ${complaints.length} complaints, escalated ${escalatedCount}`
            });
        } catch (error) {
            console.error("Escalation Check Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update complaint status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, priority, assignedTo, currentLevel } = req.body;

            // Validate ID
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: "Invalid complaint ID" });
            }

            const updateData = {
                lastUpdated: new Date()
            };

            if (status) updateData.status = status;
            if (priority) updateData.priority = priority;
            if (assignedTo) updateData.assignedTo = assignedTo;
            if (currentLevel) updateData.currentLevel = currentLevel;

            const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (updatedComplaint) {
                // Transform the response to include ID and use names
                const transformedComplaint = {
                    _id: updatedComplaint._id,
                    Store: updatedComplaint.store,
                    status: updatedComplaint.status,
                    priority: updatedComplaint.priority,
                    assignedTo: updatedComplaint.assignedTo || 'Unassigned',
                    currentLevel: updatedComplaint.currentLevel,
                    lastUpdated: new Date(updatedComplaint.lastUpdated).toLocaleString(),
                    key: updatedComplaint._id.toString()
                };

                return res.status(200).json({
                    success: true,
                    message: "Complaint updated successfully",
                    complaint: transformedComplaint
                });
            } else {
                return res.status(404).json({ error: "Complaint not found" });
            }
        } catch (error) {
            console.error("Update Status Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Get complaints for dashboard
    async getDashboardStats(req, res) {
        try {
            let query = {};
            
            // Filter by user role and access
            if (req.user) {
                if (req.user.Role === 'client') {
                    // Clients can only see complaints related to their stores
                    query.store = { $in: req.user.Stores };
                } else if (req.user.Role === 'siteManager') {
                    // Site managers can only see complaints for their assigned store
                    query.store = req.user.AssignedStore;
                }
                // Other roles can see all complaints
            }
            
            // Get all relevant complaints
            const complaints = await ComplaintModel.find(query);
            
            // Calculate statistics
            const stats = {
                total: complaints.length,
                new: complaints.filter(c => c.status === 'new').length,
                inProgress: complaints.filter(c => 
                    c.status === 'in_progress' || 
                    c.status === 'pending_client_feedback'
                ).length,
                escalated: complaints.filter(c => 
                    c.status === 'escalated_to_assistant' || 
                    c.status === 'escalated_to_manager'
                ).length,
                resolved: complaints.filter(c => c.status === 'resolved').length,
                closed: complaints.filter(c => c.status === 'closed').length,
                
                // Priority breakdown
                highPriority: complaints.filter(c => c.priority === 'high').length,
                mediumPriority: complaints.filter(c => c.priority === 'medium').length,
                lowPriority: complaints.filter(c => c.priority === 'low').length,
                
                // Category breakdown
                attendanceCategory: complaints.filter(c => c.category === 'Attendance').length,
                technicalCategory: complaints.filter(c => c.category === 'Technical').length,
                serviceCategory: complaints.filter(c => c.category === 'Service').length,
                otherCategory: complaints.filter(c => c.category === 'Other').length,
                
                // Satisfaction stats
                satisfied: complaints.filter(c => c.resolutionSatisfaction === 'satisfied').length,
                unsatisfied: complaints.filter(c => c.resolutionSatisfaction === 'not_satisfied').length
            };
            
            return res.status(200).json({
                success: true,
                stats
            });
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Delete complaint
    async deleteComplaint(req, res) {
        try {
            const { id } = req.params;

            // Validate ID
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: "Invalid complaint ID" });
            }

            const deletedComplaint = await ComplaintModel.findByIdAndDelete(id);

            if (deletedComplaint) {
                return res.status(200).json({
                    success: true,
                    message: "Complaint deleted successfully",
                    deletedComplaint: {
                        _id: deletedComplaint._id,
                        Store: deletedComplaint.store,
                        subject: deletedComplaint.subject,
                        createdBy: deletedComplaint.author
                    }
                });
            } else {
                return res.status(404).json({ error: "Complaint not found" });
            }
        } catch (error) {
            console.error("Delete Complaint Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Get single complaint by ID
    async getComplaintById(req, res) {
        try {
            const { id } = req.params;

            // Validate ID
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: "Invalid complaint ID" });
            }

            const complaint = await ComplaintModel.findById(id);

            if (complaint) {
                // Transform the response to include ID and use names
                const transformedComplaint = {
                    _id: complaint._id,
                    Store: complaint.store,
                    subject: complaint.subject,
                    description: complaint.text,
                    status: complaint.status,
                    priority: complaint.priority,
                    currentLevel: complaint.currentLevel,
                    createdBy: complaint.author,
                    createdAt: new Date(complaint.createdAt).toLocaleString(),
                    responses: complaint.conversations.map(conv => ({
                        id: conv._id,
                        message: conv.text,
                        user: conv.author,
                        timestamp: new Date(conv.createdAt).toLocaleString(),
                        role: conv.authorRole,
                        satisfactionResponse: conv.satisfactionResponse
                    })),
                    category: complaint.category,
                    mood: complaint.mood,
                    assignedTo: complaint.assignedTo || 'Unassigned',
                    resolutionSatisfaction: complaint.resolutionSatisfaction,
                    escalationHistory: complaint.escalationHistory.map(esc => ({
                        from: esc.fromLevel,
                        to: esc.toLevel,
                        reason: esc.reason,
                        timestamp: new Date(esc.timestamp).toLocaleString()
                    })),
                    key: complaint._id.toString()
                };

                return res.status(200).json({
                    success: true,
                    complaint: transformedComplaint
                });
            } else {
                return res.status(404).json({ error: "Complaint not found" });
            }
        } catch (error) {
            console.error("Get Complaint By ID Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}

const ComplaintController = new Complaint();
module.exports = ComplaintController;