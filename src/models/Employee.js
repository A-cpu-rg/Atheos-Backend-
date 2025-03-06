const mongoose = require("mongoose")

const EmployeeSchema = new mongoose.Schema(
    {
        ProfilePhoto: {
            type: String
        },
        Name: {
            type: String
        },
        Email: {
            type: String
        },
        PhoneNumber: {
            type: String
        },
        Department: {
            type: String
        },
        Designation: {
            type: String
        },
        AssignedStore: {
            type: String
        },
        JoinDate: {
            type: String
        },
        Education: {
            type: String
        },
        Address: {
            type: String
        },
        Country: {
            type: String
        },
        State: {
            type: String
        },
        City: {
            type: String
        },
        PinCode: {
            type: String
        },
        EmergencyContact: {
            type: String
        },
        BloodGroup: {
            type: String
        },

        AccountNumber: {
            type: String
        },
        IFSCCode: {
            type: String
        },
        BankName: {
            type: String
        },
        Branch: {
            type: String
        },

        Documents: [{
            type: String
        }],
        Status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    }, { timestamps: true }
)

const Employeemodel = mongoose.model("Employee", EmployeeSchema)
module.exports = Employeemodel