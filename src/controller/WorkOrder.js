const Workmodel = require("../models/Workder")
const ClientModel = require("../models/Client")
const StoreModel = require("../models/Store")

class WorkOrder{
    // Get all work orders with filtering capabilities
    async getWorkorder(req, res){
        try {
            let query = {};
            
            // Filter by client if specified
            if (req.query.clientId) {
                query.clientId = req.query.clientId;
            }
            
            // Filter by store if specified
            if (req.query.storeId) {
                query.storeId = req.query.storeId;
            }
            
            // Filter by status if specified
            if (req.query.status) {
                query.Status = req.query.status;
            }
            
            const workorders = await Workmodel.find(query).sort({ CreatedAt: -1 });
            
            if (workorders && workorders.length > 0){
                return res.status(200).json({
                    success: true,
                    count: workorders.length,
                    work: workorders
                });
            } else {
                return res.status(200).json({
                    success: true,
                    count: 0,
                    work: []
                });
            }
        } catch (error) {
            console.error('Error fetching work orders:', error);
            return res.status(500).json({error: "Internal server error"});
        }
    }

    // Update work order status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { Status, comment, assignedTo } = req.body;

            // Create update object
            const updateData = { 
                Status,
                UpatedAt: new Date()
            };

            // Add assignedTo if provided
            if (assignedTo) {
                updateData.assignedTo = assignedTo;
            }

            const updatedWorkorder = await Workmodel.findByIdAndUpdate(
                id,
                updateData,
                { new: true } // Return updated document
            );

            if (!updatedWorkorder) {
                return res.status(404).json({ error: "Work order not found" });
            }

            // Add comment if provided
            if (comment) {
                updatedWorkorder.comments.push({
                    text: comment,
                    author: req.user?.name || 'System',
                    timestamp: new Date()
                });
                await updatedWorkorder.save();
            }

            return res.status(200).json({
                success: true,
                message: "Status updated successfully",
                workorder: updatedWorkorder
            });
        } catch (error) {
            console.error('Update status error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Add a new work order (client-initiated)
    async addWorkorder(req, res) {
        try {
            const { 
                Discription, 
                Budget, 
                clientId,
                storeId 
            } = req.body;
            
            // Validate required fields
            if (!Discription || !Budget || !clientId || !storeId) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Missing required fields" 
                });
            }

            // Verify client exists
            const client = await ClientModel.findById(clientId);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    error: "Client not found"
                });
            }

            // Verify store exists
            const store = await StoreModel.findOne({ StoreCode: storeId });
            if (!store) {
                return res.status(404).json({
                    success: false,
                    error: "Store not found"
                });
            }

            // Create new work order
            const newWorkorder = await Workmodel.create({
                Discription,
                Status: 'new',
                Budget,
                clientId,
                storeId,
                CreatedAt: new Date(),
                UpatedAt: new Date(),
                comments: [{
                    text: 'Work order created',
                    author: client.Name,
                    timestamp: new Date()
                }]
            });
    
            return res.status(201).json({ 
                success: true, 
                message: "Work order created successfully",
                workorder: newWorkorder
            });
    
        } catch (error) {
            console.error('Work order creation error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Delete a work order
    async deleteWorkorder(req, res){
        try {
            const { id } = req.params;
            const deletedWorkorder = await Workmodel.findByIdAndDelete(id);
            
            if (deletedWorkorder){
                return res.status(200).json({
                    success: true,
                    message: "Work order deleted successfully"
                });
            }
            else{
                return res.status(404).json({
                    success: false,
                    error: "Work order not found"
                });
            }
        } catch (error) {
            console.error('Delete work order error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Add a comment to a work order
    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: "Comment text is required"
                });
            }

            const workorder = await Workmodel.findById(id);
            if (!workorder) {
                return res.status(404).json({
                    success: false,
                    error: "Work order not found"
                });
            }

            workorder.comments.push({
                text,
                author: req.user?.name || 'Anonymous',
                timestamp: new Date()
            });

            await workorder.save();

            return res.status(200).json({
                success: true,
                message: "Comment added successfully",
                workorder
            });
        } catch (error) {
            console.error('Add comment error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}

const WorkderController = new WorkOrder();
module.exports = WorkderController;