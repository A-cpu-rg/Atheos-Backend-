const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema(
    {
        EmployeeCode: {
            type: String,
            unique: true
        },
        ProfilePhoto: {
            type: String
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
        Department: {
            type: String,
            required: true
        },
        Designation: {
            type: String,
            required: true
        },
        // Store code the employee is assigned to
        AssignedStore: {
            type: String,
            ref: 'Store'
        },
        // Hub codes the employee is assigned to (multiple)
        AssignedHub: {
            type: [String],
            default: []
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
        // System role based on designation
        Role: {
            type: String,
            enum: ['siteManager', 'assistantManager', 'topManagement', 'middleManagement', 'employee'],
            default: 'employee'
        },
        Documents: [{
            type: String
        }],
        Status: {
            type: String,
            enum: ["Active", "Inactive","Pending","Rejected"],
            default: "Active"
        },
        LastLogin: {
            type: Date
        }
    }, { timestamps: true }
)

// Static method to generate employee code
EmployeeSchema.statics.generateEmployeeCode = async function(department) {
    try {
        const prefix = 'EMP';
        const deptCode = department ? department.substring(0, 3).toUpperCase() : 'GEN';
        
        // Find the last employee code for this department
        const lastEmployee = await this.findOne(
            { EmployeeCode: new RegExp(`^${prefix}-${deptCode}-`, 'i') },
            { EmployeeCode: 1 }
        ).sort({ EmployeeCode: -1 });

        let nextNumber = 1;
        if (lastEmployee && lastEmployee.EmployeeCode) {
            // Extract the number from the last code and increment
            const lastNumber = parseInt(lastEmployee.EmployeeCode.split('-')[2]);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        // Generate new code with padded number
        const employeeCode = `${prefix}-${deptCode}-${String(nextNumber).padStart(4, '0')}`;
        return employeeCode;
    } catch (error) {
        console.error('Error generating employee code:', error);
        throw error;
    }
};

// Pre-save middleware
EmployeeSchema.pre("save", async function(next) {
    try {
        // Generate employee code for new employees
        if (this.isNew && !this.EmployeeCode) {
            this.EmployeeCode = await this.constructor.generateEmployeeCode(this.Department);
        }

        // Hash password if modified
        if (this.isModified("Password")) {
            this.Password = await bcrypt.hash(this.Password, 10);
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords for authentication
EmployeeSchema.methods.comparePassword = async function (candidatePassword) {
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

// Method to set role based on designation
EmployeeSchema.methods.setRoleFromDesignation = function() {
    const designation = this.Designation.toLowerCase();
    
    if (designation.includes('site manager')) {
        this.Role = 'siteManager';
    } else if (designation.includes('assistant manager')) {
        this.Role = 'assistantManager';
    } else if (designation.includes('top management') || designation.includes('director')) {
        this.Role = 'topManagement';
    } else if (designation.includes('middle management') || designation.includes('manager')) {
        this.Role = 'middleManagement';
    } else {
        this.Role = 'employee';
    }
};

const Employeemodel = mongoose.model("Employee", EmployeeSchema)
module.exports = Employeemodel