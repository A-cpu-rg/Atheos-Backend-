const ComplaintModel = require("../models/Complaint");

class Complaint {

    async getComplaint(req, res) {
        try {
            const getComplaint = await ComplaintModel.find({});
            if (getComplaint) {
                return res.status(200).json({ COM: getComplaint });

            } else {
                return res.status(400).status.json({ error: "something went wrong" })
            }
        } catch (error) {
            return res.status(500).json({ error: "Internel Server error" })
        }
    }

    async addComplaint(req, res) {
        try {
            const { store, text, author, authorRole, status, mood, conversations, priority,
                category, assignedTo, lastUpdated } = req.body;
            console.log(store, text, author, authorRole, status, mood, conversations, priority,
                category, assignedTo, lastUpdated)
            const newComplaint = await ComplaintModel.create({
                store, text, author, authorRole, status, mood, conversations, priority,
                category, assignedTo, lastUpdated
            });

            if (newComplaint) {
                return res.status(200).json({ success: "Complaint created successfully" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}

const ComplaintController = new Complaint();
module.exports = ComplaintController;
