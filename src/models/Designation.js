const {  mongoose } = require("mongoose");

const DesignationSchema =new mongoose.Schema(
    {
        Designation:{
            type: String,
        },
        Description:{
            type : String,
        },
        Department:{
            type:String,
        },
    
        
    },
    { timestamps: true }
)

const DesignationModel = mongoose.model("Designation", DesignationSchema);
module.exports = DesignationModel;