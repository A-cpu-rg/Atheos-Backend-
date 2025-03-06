const Hubmodel = require("../models/Hub");

class Hub {
    async addHub(req, res) {
        try {
            const { HubName } = req.body;
            console.log(HubName , "hubNmae")
            const AddHubTittle = await Hubmodel.create({ HubName });

            if (AddHubTittle) {
                return res.status(200).json({ success: "Hub Name added" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API error" });
        }
    }
    async getHub(req, res) {
        try {
            const getHubTittle = await Hubmodel.find({});
            console.log(getHubTittle)

            if (getHubTittle) {
                return res.status(200).json({HubTittle:getHubTittle});
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API error" });
        }
    }
    async updateHub(req, res) {
        try {
            const { id } = req.params;
            const { HubName } = req.body;
            const UpdateHub = await Hubmodel.findByIdAndUpdate(
                id,
                { HubName },
                { new: true, runValidators: true }
            );

            if (UpdateHub) {
                return res.status(200).json({ success: "Successfully Updated" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API error" });
        }
    }

    async deleteHub(req, res) {
        try {
            const { id } = req.params;
            const DeleteHub = await Hubmodel.findByIdAndDelete(id);

            if (DeleteHub) {
                return res.status(200).json({ success: "Deleted Successfully" });
            } else {
                return res.status(400).json({ error: "Something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "API error" });
        }
    }
}

const HubtittleController = new Hub();
module.exports = HubtittleController;
