const Workmodel = require("../models/Workder")

class WorkOrder{
    async getWorkorder (req , res){
        try {
            const getWorkorder = await Workmodel.find({});
            if (getWorkorder){
                return res.status(200).json({work:getWorkorder})
            }else{
                return res.status(400).json({error:"Something went wrong"})
            }
        } catch (error) {
            return res.status(500).json({error : "Internel server error"})
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { Status } = req.body;

            const updatedWorkorder = await Workmodel.findByIdAndUpdate(
                id,
                { 
                    Status,
                    UpatedAt: new Date()
                },
                { new: true } // This option returns the updated document
            );

            if (updatedWorkorder) {
                return res.status(200).json({
                    success: "Status updated successfully",
                    workorder: updatedWorkorder
                });
            } else {
                return res.status(400).json({ error: "Work order not found" });
            }
        } catch (error) {
            console.error('Update status error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    async addWorkorder(req, res) {
        try {
            const { Discription, Status, Budget, CreatedAt, UpatedAt } = req.body;
            
            // Validate required fields
            if (!Discription || !Status || !Budget) {
                return res.status(400).json({ error: "Missing required fields" });
            }
    
            const newWorkorder = await Workmodel.create({
                Discription,
                Status,
                Budget,
                CreatedAt: new Date(CreatedAt),
                UpatedAt: new Date(UpatedAt)
            });
    
            return res.status(200).json({ success: "Added new workorder" });
    
        } catch (error) {
            console.error('Work order creation error:', error); // Add this for debugging
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async deleteWorkorder (req , res){
        try {
            const {id} = req.params;
            const deleteWorkorder = await Workmodel.findByIdAndDelete(id);
            if (deleteWorkorder){
                return res.status(200).json({success:"deleted succefully"})
            }
            else{
                return res.status(400).json({error:"something went wrong"})
            }
        } catch (error) {
            return res.status(500).json({error:"Internel server error"})
        }
    }
}

const WorkderController = new WorkOrder();
module.exports = WorkderController;