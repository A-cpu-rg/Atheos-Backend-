const Clientmodel = require("../models/Client")

class Client {
    async addClient(req , res){
        try {
            const {name , email , phone , store , hub , address } = req.body
            // console.log(name , email , phone , store , hub , address)
            let profilePhoto = req.file ? req.file.filename:null
            const newCleint = await Clientmodel.create({
                name , email ,phone , store , hub ,  address , profilePhoto
            })
            if(newCleint){
                return res.status(200).json({success:"client successfully add"})

            }
            else{
                return res.status(400).json({error:"something went wrong"})
            }
        } catch (error) {
            return res.status(500).json({error:"Internel server error "})
        }
    }
    async getClient(req , res){
        try {
            const getClient = await Clientmodel.find({});
            if (getClient){
                return res.status(200).json({cm:getClient})
            }
            else{
                return res.status(400).status.json({error:"something went wrong"})
            }
        } catch (error) {
            return res.status(500).json({error:"Internel server error "})
        }
    }

    async updateClient(req, res) {
        try {
            const { id } = req.params;
            // console.log("Updating client with ID:", id);
    
            const { profilePhoto, name, email, phone, store, hub, address } = req.body;
            // console.log(profilePhoto, name, email, phone, store, hub, address )
    
            const updateClient = await Clientmodel.findByIdAndUpdate(
                id,
                { profilePhoto, name, email, phone, store, hub, address },
                { new: true, runValidators: true }
            );
            console.log(updateClient)
    
            if (updateClient) {
                return res.status(200).json({ success: updateClient });
            } else {
                return res.status(400).json({ error: "Client not found" });
            }
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    async deleteClient(req, res){
        try {
            const {id} = req
        } catch (error) {
            
        }
    }
}

const ClientController = new Client();
module.exports = ClientController;