const { mongoose, model } = require("mongoose");

const HubSchema = new mongoose.Schema(
    {
        HubName: {
            type: String,
        }, 
    },
    { timestamps: true } 
);

const Hubmodel = mongoose.model("Hub", HubSchema);
module.exports = Hubmodel;
