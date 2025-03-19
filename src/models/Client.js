const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const clientSchema = new mongoose.Schema({
    ProfilePhoto: {
        type: String,
        default: null
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    PhoneNumber: {
        type: String,
        required: true
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
    // Store codes that this client is associated with (can be multiple)
    Stores: [{
        type: String,
        ref: 'Store'
    }],
    Hub: {
        type: String
    },
    // User role in the system
    Role: {
        type: String,
        default: 'client'
    },
    Documents: [{
        type: String
    }],
    Status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    LastLogin: {
        type: Date
    }
}, { timestamps: true });

// Hash password before saving client
clientSchema.pre("save", async function (next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified("Password")) return next();
    try {
        this.Password = await bcrypt.hash(this.Password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords for authentication
clientSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword || !this.Password) {
        console.log('Missing password for comparison');
        return false;
    }
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.Password);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

const ClientModel = mongoose.model("Client", clientSchema);
module.exports = ClientModel;