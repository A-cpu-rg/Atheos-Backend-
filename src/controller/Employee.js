const Employeemodel = require("../models/Employee")

class Employee {

    async getEmployee(req, res) {
        try {
            const getEmployee = await Employeemodel.find({});
            if (getEmployee) {
                return res.status(200).json({ EM: getEmployee });
            } else {
                return res.status(400).json({ error: "something went wrong" });
            }
        } catch (error) {
            return res.status(500).json({ error: "internel server error" })
        }
    }

    async addEmployee(req, res) {
        try {
            const {Name, Email, PhoneNumber, Department, Designation, AssignedStore, JoinDate, Education,
                Address, Country, State, City, PinCode, EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Documents, Status
            } = req.body
            console.log(req.body , req.file)
            let ProfilePhoto = req.file ? req.file.filename : null

            const newEmployee = await Employeemodel.create({
                ProfilePhoto, Name, Email, PhoneNumber, Department, Designation, AssignedStore, JoinDate, Education,
                Address, Country, State, City, PinCode, EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Documents, Status
            })
            if (newEmployee) {
                return res.status(200).json({ success: "Add new Employee" })
            } else {
                return res.status(400).json({ error: "Something went wrong" })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Internel Server error" })
        }
    }

    async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            const { ProfilePhoto, Name, Email, PhoneNumber, Department, Designation, AssignedStore, JoinDate, Education,
                Address, Country, State, City, PinCode, EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Documents, Status } = req.body;
            const updateEmployee = await Employeemodel.findByIdAndUpdate(id,
                {ProfilePhoto, Name, Email, PhoneNumber, Department, Designation, AssignedStore, JoinDate, Education,
                    Address, Country, State, City, PinCode, EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                    Documents, Status},
                {new:true , runValidators:true}
                )  ;  
                if (updateEmployee){
                    return res.status(200).json({success : "updated succefully"})
                }else{
                    return res.status(400).json({error:"somthing went wrong"})   
                }
        } catch (error) {
            return res.status(500).json({error:"Internel server error "})
        }
    }
    async deleteEmployee(req,res){
        try {
            const {id} = req.params;
        const deleteEmployee = await Employeemodel.findByIdAndDelete(id);
        if (deleteEmployee){
            return res.status(200).json({success:"delete succefully"})
        }else{
            return res.status(400).json({error:"Something went wrong"})
        }
        } catch (error) {
            return res.status(500).json({error:"Internel server error"})
        }
    }
}
const EmployeeController = new Employee();
module.exports = EmployeeController;