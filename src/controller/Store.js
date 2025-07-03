const StoreModal = require("../models/Store")

class Store {

    async getStore(req, res) {
        try {
            const getStore = await StoreModal.find({})
            if (getStore) {
                return res.status(200).json({SotreTittle:getStore})
            }
            else {
                return res.status(400).json({ error: "something went wrong" })
            }
        } catch (error) {
            return res.status(500).json({ error: "Api Error" })
        }
    }

    async addStore(req, res) {
        try {
            console.log("test")
            const { StoreName, Address, PhoneNumber, Email,Password, Country, State, District, City, Hub, Status,FOE } = req.body;
            let StorePhoto = req.file ? req.file.filename : null;
            const generateStoreCode = () => {
                return 'AT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            };
    
            let StoreCode = generateStoreCode();
    
            let isUnique = false;
            while (!isUnique) {
                const existingStore = await StoreModal.findOne({ StoreCode });
                if (!existingStore) {
                    isUnique = true;
                } else {
                    StoreCode = generateStoreCode(); // Regenerate if not unique
                }
            }
    
            const newStore = await StoreModal.create({
                StorePhoto, StoreName, StoreCode, Address, PhoneNumber, Email, Password,Country, State, District, City, Hub, Status ,FOE
            });
    
            return res.status(201).json({ success: "Store added successfully", store: newStore });
        } catch (error) {
            console.error("Error in addStore:", error);  // Logs error to console
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }
    
    
    
    async updateStore(req , res) {
        try {
            const { id } = req.params;
            const {StorePhoto,StoreName,StoreCode,
                Address, PhoneNumber, Email,Password,Country,State ,District,City,Hub,Status,FOE} = req.body
            const updateStore = await StoreModal.findByIdAndUpdate(id,
                {
                    StorePhoto,StoreName,StoreCode,
                    Address, PhoneNumber, Email,Password,Country,State ,District,City,Hub,Status,FOE
                },
                {
                    new :true , runValidators: true
                }
                
            )
            if(updateStore){
                return res.status(200).json({success : "update successfully"})
            }else{
                return res.status(400).json({error:"something went wrong"})
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({error:"Internal server error"})
        }
    }
    async deleteStore (req , res){
        try {
            const {id} = req.params;
            const deleteStore = await StoreModal.findByIdAndDelete(id);
            if (deleteStore){
                return res.status(200).json({success:"successfully Deleted"});
            } 
            else{
                return res.status(400).json({error :"Something went wrong"});
            }
        } catch (error) {
            return res.status(500).json({error:"Internal server error"})
        }
    }
}
const StoreController = new Store();
module.exports = StoreController;
