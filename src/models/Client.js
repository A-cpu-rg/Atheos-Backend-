const {mongoose} = require("mongoose")

const ClientSchema = new mongoose.Schema(
    {
        profilePhoto:{
            type : String
        },
        name :{
            type : String
        },
        phone : {
            type :String
        },
        store :{
            type : String
        },
        email:{
            type : String
        },
        hub : {
            type :String
        },
        address:{
            type :String
        }

    },{timestamps:true}
)

const Clientmodel = mongoose.model("Client" , ClientSchema);
module.exports = Clientmodel