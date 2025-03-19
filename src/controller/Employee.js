const Employeemodel = require("../models/Employee")
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

class Employee {
    async getEmployee(req, res) {
        try {
            const getEmployee = await Employeemodel.find({})
                // .select('-Password'); // Exclude password from response
                
            if (getEmployee) {
                return res.status(200).json({ EM: getEmployee });
            } else {
                return res.status(400).json({ error: "No employees found" });
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async addEmployee(req, res) {
        try {
            const {
                Name, Email, Password, PhoneNumber, Department, Designation, AssignedStore, 
                AssignedHub, JoinDate, Education, Address, Country, State, City, PinCode, 
                EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Status
            } = req.body;
            
            console.log('Request body:', req.body);
            console.log('Uploaded files:', req.files);
            
            // Check if email already exists
            const existingEmployee = await Employeemodel.findOne({ Email });
            if (existingEmployee) {
                return res.status(400).json({ error: "Email already exists" });
            }
            
            // Handle profile photo with proper error checking
            let ProfilePhoto = null;
            if (req.files && req.files.ProfilePhoto && req.files.ProfilePhoto.length > 0) {
                ProfilePhoto = req.files.ProfilePhoto[0].filename;
            }
            
            // Handle document files
            let Documents = [];
            if (req.files && req.files.Documents && req.files.Documents.length > 0) {
                Documents = req.files.Documents.map(file => file.filename);
            }

            // Handle AssignedHub (support for multiple hubs)
            let processedAssignedHub = [];
            if (AssignedHub) {
                if (AssignedHub === '') {
                    processedAssignedHub = [];
                } else if (Array.isArray(AssignedHub)) {
                    processedAssignedHub = AssignedHub;
                } else {
                    processedAssignedHub = [AssignedHub];
                }
            }

            // Create new employee instance
            const newEmployee = new Employeemodel({
                ProfilePhoto, 
                Name, 
                Email, 
                Password, 
                PhoneNumber, 
                Department, 
                Designation, 
                AssignedStore,
                AssignedHub: processedAssignedHub,
                JoinDate, 
                Education, 
                Address, 
                Country, 
                State, 
                City, 
                PinCode, 
                EmergencyContact, 
                BloodGroup, 
                AccountNumber, 
                IFSCCode, 
                BankName, 
                Branch,
                Status: Status || "Active",
                Documents
            });
            
            // Set role based on designation
            newEmployee.setRoleFromDesignation();
            
            // Save employee to database
            await newEmployee.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: newEmployee._id, userType: 'employee' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({ 
                success: true, 
                message: "Employee added successfully",
                employee: {
                    id: newEmployee._id,
                    EmployeeCode: newEmployee.EmployeeCode,
                    Name: newEmployee.Name,
                    Email: newEmployee.Email,
                    Designation: newEmployee.Designation,
                    Role: newEmployee.Role,
                    AssignedStore: newEmployee.AssignedStore,
                    AssignedHub: newEmployee.AssignedHub,
                    ProfilePhoto: newEmployee.ProfilePhoto,
                    Documents: newEmployee.Documents
                },
                token
            });
        } catch (error) {
            console.error("Error adding employee:", error);
            return res.status(500).json({ error: error.message || "Internal server error" });
        }
    }

    // Employee login
    async loginEmployee(req, res) {
        try {
            const { Email, Password } = req.body;
            console.log("Employee Login Attempt:", Email);
            console.log("Request body:", req.body);
            
            if (!Email || !Password) {
                console.log("Missing email or password");
                return res.status(400).json({ error: "Email and password are required" });
            }

            // Find employee by email
            const employee = await Employeemodel.findOne({ Email });
            if (!employee) {
                console.log(`Employee not found for email: ${Email}`);
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Check if employee is active
            if (employee.Status === 'Inactive') {
                console.log(`Account inactive for email: ${Email}`);
                return res.status(403).json({ error: "Account is inactive" });
            }

            console.log(`Employee found: ${employee._id}, Role: ${employee.Role}`);
            
            // Verify password
            const isMatch = await employee.comparePassword(Password);
            console.log(`Password match result: ${isMatch}`);
            
            if (!isMatch) {
                console.log("Password mismatch");
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: employee._id, userType: 'employee' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Update last login timestamp
            employee.LastLogin = new Date();
            await employee.save();

            console.log(`Login successful for employee: ${employee.Name} (${employee._id})`);

            return res.status(200).json({
                success: true,
                message: "Login successful",
                employee: {
                    id: employee._id,
                    EmployeeCode: employee.EmployeeCode,
                    Name: employee.Name,
                    Email: employee.Email,
                    Designation: employee.Designation,
                    Role: employee.Role,
                    AssignedStore: employee.AssignedStore,
                    AssignedHub: employee.AssignedHub
                },
                token
            });
        } catch (error) {
            console.error("Employee login error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update employee details
    async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            
            // Find the employee by _id or EmployeeCode
            let employee;
            if (mongoose.Types.ObjectId.isValid(id)) {
                employee = await Employeemodel.findById(id);
            } else {
                employee = await Employeemodel.findOne({ EmployeeCode: id });
            }
            
            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }
            
            const { 
                Name, Email, PhoneNumber, Department, Designation, AssignedStore, 
                AssignedHub, JoinDate, Education, Address, Country, State, City, PinCode, 
                EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Password, Status
            } = req.body;
            
            console.log('Update request body:', req.body);
            console.log('Update files:', req.files);
            
            // Create update object
            const updateData = { 
                Name, Email, PhoneNumber, Department, Designation, AssignedStore, 
                JoinDate, Education, Address, Country, State, City, PinCode, 
                EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Status
            };

            // Handle AssignedHub specially to support multiple values
            if (AssignedHub !== undefined) {
                // If it's an empty value, set to empty array
                if (AssignedHub === '') {
                    updateData.AssignedHub = [];
                } 
                // Check if it's already an array in the request
                else if (Array.isArray(AssignedHub)) {
                    updateData.AssignedHub = AssignedHub;
                }
                // If we have multiple values with the same name in FormData
                else if (AssignedHub && req.originalUrl && Array.isArray(req.originalUrl)) {
                    updateData.AssignedHub = req.originalUrl; // This would contain all the values
                }
                // Single value
                else {
                    updateData.AssignedHub = [AssignedHub];
                }
            }
            
            // Handle profile photo if provided
            if (req.files && req.files.ProfilePhoto && req.files.ProfilePhoto.length > 0) {
                updateData.ProfilePhoto = req.files.ProfilePhoto[0].filename;
                
                // Delete old profile photo if exists
                if (employee.ProfilePhoto) {
                    const oldProfilePath = path.join(__dirname, '../Public/Employee', employee.ProfilePhoto);
                    if (fs.existsSync(oldProfilePath)) {
                        fs.unlinkSync(oldProfilePath);
                    }
                }
            }
            
            // Handle document files if provided
            if (req.files && req.files.Documents && req.files.Documents.length > 0) {
                // Get existing documents
                const existingDocs = employee.Documents || [];
                // Add new documents
                const newDocs = req.files.Documents.map(file => file.filename);
                // Combine existing and new documents
                updateData.Documents = [...existingDocs, ...newDocs];
            }
            
            // Handle password update separately
            if (Password) {
                employee.Password = Password;
                await employee.save();
            }

            // Update role based on designation if changed
            if (Designation && employee.Designation !== Designation) {
                employee.Designation = Designation;
                employee.setRoleFromDesignation();
                updateData.Role = employee.Role;
            }
            
            const updateEmployee = await Employeemodel.findByIdAndUpdate(
                employee._id,
                updateData,
                { new: true, runValidators: true }
            ).select('-Password');
            
            if (updateEmployee) {
                return res.status(200).json({
                    success: true,
                    message: "Employee updated successfully",
                    employee: updateEmployee
                });
            } else {
                return res.status(404).json({ error: "Employee not found" });
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            return res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    
    // Delete employee
    async deleteEmployee(req, res) {
        try {
            const { id } = req.params;
            
            // Find the employee by _id or EmployeeCode
            let employee;
            if (mongoose.Types.ObjectId.isValid(id)) {
                employee = await Employeemodel.findById(id);
            } else {
                employee = await Employeemodel.findOne({ EmployeeCode: id });
            }
            
            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }
            
            const deleteEmployee = await Employeemodel.findByIdAndDelete(employee._id);
            
            if (deleteEmployee) {
                return res.status(200).json({
                    success: true,
                    message: "Employee deleted successfully"
                });
            } else {
                return res.status(404).json({ error: "Employee not found" });
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    
    // Delete a document from an employee
    async deleteDocument(req, res) {
        try {
            const { id, documentName } = req.params;
            
            // Find the employee by _id or EmployeeCode
            let employee;
            if (mongoose.Types.ObjectId.isValid(id)) {
                employee = await Employeemodel.findById(id);
            } else {
                employee = await Employeemodel.findOne({ EmployeeCode: id });
            }
            
            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }
            
            // Check if document exists in employee's documents
            if (!employee.Documents.includes(documentName)) {
                return res.status(404).json({ error: "Document not found" });
            }
            
            // Remove document from employee's documents array
            employee.Documents = employee.Documents.filter(doc => doc !== documentName);
            await employee.save();
            
            // Delete the file from filesystem
            const documentPath = path.join(__dirname, '../Public/Employee/Documents', documentName);
            if (fs.existsSync(documentPath)) {
                fs.unlinkSync(documentPath);
            }
            
            return res.status(200).json({
                success: true,
                message: "Document deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting document:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    
    // Get employee by ID
    async getEmployeeById(req, res) {
        try {
            const { id } = req.params;
            
            // Find the employee by _id or EmployeeCode
            let employee;
            if (mongoose.Types.ObjectId.isValid(id)) {
                employee = await Employeemodel.findById(id).select('-Password');
            } else {
                employee = await Employeemodel.findOne({ EmployeeCode: id }).select('-Password');
            }
            
            if (employee) {
                return res.status(200).json({
                    success: true,
                    employee
                });
            } else {
                return res.status(404).json({ error: "Employee not found" });
            }
        } catch (error) {
            console.error("Error fetching employee:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    
    // Get employees by store
    async getEmployeesByStore(req, res) {
        try {
            const { storeId } = req.params;
            
            const employees = await Employeemodel.find({ 
                AssignedStore: storeId,
                Status: 'Active'
            }).select('-Password');
            
            return res.status(200).json({
                success: true,
                count: employees.length,
                employees
            });
        } catch (error) {
            console.error("Error fetching employees by store:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Get employees by hub
    async getEmployeesByHub(req, res) {
        try {
            const { hubId } = req.params;
            
            const employees = await Employeemodel.find({ 
                AssignedHub: hubId,
                Status: 'Active'
            }).select('-Password');
            
            return res.status(200).json({
                success: true,
                count: employees.length,
                employees
            });
        } catch (error) {
            console.error("Error fetching employees by hub:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Create a test employee with a known password
    async createTestEmployee(req, res) {
        try {
            // Check if test employee already exists
            const existingEmployee = await Employeemodel.findOne({ Email: "testemployee@example.com" });
            if (existingEmployee) {
                return res.status(200).json({ 
                    message: "Test employee already exists",
                    credentials: {
                        email: "testemployee@example.com",
                        password: "password123"
                    }
                });
            }
            
            // Create new test employee
            const newEmployee = new Employeemodel({
                Name: "Test Employee",
                Email: "testemployee@example.com",
                Password: "password123", // Will be hashed by pre-save hook
                PhoneNumber: "1234567890",
                Department: "Testing",
                Designation: "Tester",
                Status: "Active"
            });
            
            // Set role based on designation
            newEmployee.setRoleFromDesignation();
            
            await newEmployee.save();
            
            return res.status(201).json({
                success: true,
                message: "Test employee created successfully",
                credentials: {
                    email: "testemployee@example.com",
                    password: "password123"
                }
            });
        } catch (error) {
            console.error("Error creating test employee:", error);
            return res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
}

const EmployeeController = new Employee();
module.exports = EmployeeController;