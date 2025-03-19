// const mongoose = require("mongoose");

// const EmSchema = new mongoose.Schema(
//     {
//         ProfilePhoto:{
//             type:String
//         },
//         EmployeeName: {
//             type: String
//         },
//         Store: {
//             type: String
//         },
//         Designation: {
//             type: String
//         },
//         Email: {
//             type: String,
//             unique: true
//         },
//         Password: {
//             type: String
//         },
//         Hub:{
//             type:String
//         },
//         PhoneNumber: {
//             type: String,
//             // required: true,
//             // unique: true,
//             // match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
//         },
//         JoiningDate: {
//             type: String
//         },
//         Status: {
//             type: String,
//             enum: ["Active", "Inactive"],
//             default: "Active",
//         }
//     },

//     { timestamps: true }
// );
// const Emmodel = mongoose.model("Em", EmSchema);
// module.exports = Emmodel;