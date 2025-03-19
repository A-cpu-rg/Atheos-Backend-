// const Emmodel = require("../models/StoreEm")

// class StoreEmployee {

//     async getStoreEmployee(req,res){
//         try {
//             const getStoreEmployee = await Emmodel.find({})
//             if(getStoreEmployee){
//                 return res.status(200).json({Name:getStoreEmployee})
//             }else{
//                 return res.status(400).json({error:"somthing went wrong"})
//             }
//         } catch (error) {
//             return res.status(500).json({error:"Internel get error"})
//         }
//     }

//     async addStoreEmployee(req, res) {
//         try {
//             const { EmployeeName, Store, Hub,Designation, Email, PhoneNumber, JoiningDate,Status } = req.body;
//             let ProfilePhoto = req.file ? req.file.filename : null
//             console.log(EmployeeName, Store, Designation, Email, PhoneNumber, JoiningDate,Status )
//             const newaddStoreEmployee = await Emmodel.create({
//                 ProfilePhoto,EmployeeName, Store,Hub, Designation, Email, PhoneNumber, JoiningDate,Status
//             });
//             if (newaddStoreEmployee) {
//                 return res.status(200).json({ success: "Added new Employee" })
//             } else {
//                 return res.status(400).json({ error: "something went wrong" });
//             }
//         } catch (error) {
//             console.log(error)
//             return res.status(500).json({ error: "Internel sarver error" })
//         }
//     }
//     async deleteStoreEmployee(req,res){
//         try {
//             const {id} = req.params;
//             const deleteStoreEmployee = await Emmodel.findByIdAndDelete(id);
//             if(deleteStoreEmployee){
//                 return res.status(200).json({success : "Deleted Successfully"});
//             }else{
//                 return res.status(400).json({error : "Something went wrong "});
//             }
//         } catch (error) {
//             return res.status(500).json({error:"Internel server error"})
//         }
//     }
//     async updateStoreEmployee(req,res){
//         try {
//             const {id} = req.params;
//             const {ProfilePhoto,EmployeeName, Store, Hub,Designation, Email, PhoneNumber, JoiningDate,Status} = req.body;
//             const updateStoreEmployee = await Emmodel.findByIdAndUpdate(
//                 id,
//                 {ProfilePhoto,EmployeeName, Store, Designation, Email, PhoneNumber, Hub,JoiningDate,Status},
//                 {new :true , runValidators:true}
//             )
//             console.log(req.body)
//             if (updateStoreEmployee){
//                 return res.status(200).json({success:"update Succefully"})
//             }
//             else{
//                 return res.status(400).json({error:"Something went wrong"})
//             }
//         } catch (error) {
//             console.log(error)
//             return res.status(500).json({error:"Internel server error"});            
//         }
//     }
// }

// const StoreEmployeeController = new StoreEmployee();
// module.exports = StoreEmployeeController;