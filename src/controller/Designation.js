const DesignationModel = require('../models/Designation');

class Designation {
    async addDesignation(req, res) {
        try {
            const { Designation, Description , Department} = req.body;
            const newDesignation = await DesignationModel.create({
                Designation, Description , Department
            });

            if (newDesignation) {
                return res.status(200).json({ success: "Added new Designation" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API Error" });
        }
    }
    async getDesignation(req, res) {
        try {
            const getDesignation = await DesignationModel.find({});

            if (getDesignation) {
                return res.status(200).json({Design:getDesignation});
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API  Error" });
        }
    }

    async updateDesignation(req, res) {
        try {
            const { id } = req.params;
            const { Designation, Description , Department} = req.body;
            const updatedDesignation = await DesignationModel.findByIdAndUpdate(
                id,
                { Designation, Description, Department},
                { new: true, runValidators: true }
            );

            if (updatedDesignation) {
                return res.status(200).json({ success: "Successfully updated" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API Error" });
        }
    }

    async deleteDesignation(req, res) {
        try {
            const { id } = req.params;
            const deletedDesignation = await DesignationModel.findByIdAndDelete(id);

            if (deletedDesignation) {
                return res.status(200).json({ success: "Deleted successfully" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API Error" });
        }
    }
}

const DesignationController = new Designation();
module.exports = DesignationController;
