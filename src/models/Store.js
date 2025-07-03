const mongoose = require("mongoose");

// Counter Schema for tracking StoreCode sequence
const counterSchema = new mongoose.Schema({
    _id: String,
    sequence_value: Number
});

const Counter = mongoose.model("StoreCounter", counterSchema);

// Function to generate the next StoreCode
async function getNextStoreCode() {
    const counter = await Counter.findOneAndUpdate(
        { _id: "store_code" },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return "AS" + counter.sequence_value.toString().padStart(3, '0'); // AS001, AS002, etc.
}

// Store Schema with auto-generated StoreCode
const StoreSchema = new mongoose.Schema(
    {
        StorePhoto: {
            type: String,
        },

        StoreName: {
            type: String,
        },

        StoreCode: {
            type: String,
            unique: true,
        },

        Address: {
            type: String,
        },

        PhoneNumber: {
            type: String,
            // required: true,
            unique: true,
            // match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
        },

        Email: {
            type: String,
        },
        Password:{
            type:String,
        },

        Country: {
            type: String,
        },

        State: {
            type: String,
        },

        District: {
            type: String,
        },

        City: {
            type: String,
        },

        Hub: {
            // type: mongoose.Schema.Types.ObjectId,
            type:String,
          },

        Status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        FOE:{
            type:String,
            reqiured:true
        }
    },
    { timestamps: true }
    
);

// Middleware to auto-generate StoreCode before saving
StoreSchema.pre("save", async function (next) {
    if (!this.StoreCode) {
        this.StoreCode = await getNextStoreCode();
    }
    next();
});

const StoreModel = mongoose.model("Store", StoreSchema);

module.exports = StoreModel;
