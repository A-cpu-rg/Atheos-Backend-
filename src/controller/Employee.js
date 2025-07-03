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

    // async addEmployee(req, res) {
    //     try {
    //         const {
    //             Name, Email, Password, PhoneNumber, Department, Designation, AssignedStore,
    //             AssignedHub, JoinDate, Education, Address, Country, State, City, PinCode,
    //             EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
    //             Status, AssignedFOC
    //         } = req.body;

    //         console.log("===== DEBUG START =====");
    //         console.log("req.body:", req.body);
    //         console.log("Object.keys(req.body):", Object.keys(req.body));
    //         console.log("AssignedFOC:", req.body.AssignedFOC);
    //         console.log("AssignedFOC:", req.body.AssignedHub);
    //         console.log("req.files:", req.files);
    //         console.log("===== DEBUG END =====");


    //         console.log('Request body:', req.body);
    //         console.log('Uploaded files:', req.files);

    //         // Check if email already exists
    //         const existingEmployee = await Employeemodel.findOne({ Email });
    //         if (existingEmployee) {
    //             return res.status(400).json({ error: "Email already exists" });
    //         }

    //         // Determine status based on who's creating the employee
    //         let finalStatus = Status || "Active";
    //         if (req.user && req.user.role === 'siteManager') {
    //             finalStatus = "Pending"; // Site managers' additions always need approval
    //         }

    //         // Handle profile photo with proper error checking
    //         let ProfilePhoto = null;
    //         if (req.files && req.files.ProfilePhoto && req.files.ProfilePhoto.length > 0) {
    //             ProfilePhoto = req.files.ProfilePhoto[0].filename;
    //         }

    //         // Handle document files
    //         let Documents = [];
    //         if (req.files && req.files.Documents && req.files.Documents.length > 0) {
    //             Documents = req.files.Documents.map(file => file.filename);
    //         }

    //         // Handle AssignedHub (support for multiple hubs)
    //         let processedAssignedHub = [];

    //         if (AssignedHub) {
    //             if (AssignedHub === '') {
    //                 processedAssignedHub = [];
    //             } else if (Array.isArray(AssignedHub)) {
    //                 processedAssignedHub = AssignedHub;
    //             } else {
    //                 processedAssignedHub = [AssignedHub];
    //             }
    //         }

    //         if (AssignedFOC) {
    //             console.log("assignedFOC", AssignedFOC)

    //         }

    //         // Normalize AssignedStore to always be an array
    //         let processedAssignedStore = [];

    //         if (AssignedStore) {
    //             if (Array.isArray(AssignedStore)) {
    //                 processedAssignedStore = AssignedStore;
    //             } else {
    //                 processedAssignedStore = [AssignedStore];  // wrap single string
    //             }
    //         }


    //         // Create new employee instance
    //         const newEmployee = new Employeemodel({
    //             ProfilePhoto,
    //             Name,
    //             Email,
    //             Password,
    //             PhoneNumber,
    //             Department,
    //             Designation,
    //             AssignedStore: processedAssignedStore,
    //             AssignedHub: processedAssignedHub,
    //             JoinDate,
    //             Education,
    //             Address,
    //             Country,
    //             State,
    //             City,
    //             PinCode,
    //             EmergencyContact,
    //             BloodGroup,
    //             AccountNumber,
    //             IFSCCode,
    //             BankName,
    //             Branch,
    //             Status: finalStatus,
    //             Documents,
    //             AssignedFOC,
    //             AssignedHub
    //         });
    //         console.log('..................', newEmployee);
    //         // Set role based on designation
    //         newEmployee.setRoleFromDesignation();

    //         // Save employee to database
    //         await newEmployee.save();

    //         // Generate JWT token
    //         const token = jwt.sign(
    //             { userId: newEmployee._id, userType: 'employee' },
    //             process.env.JWT_SECRET,
    //             { expiresIn: '7d' }
    //         );

    //         return res.status(201).json({
    //             success: true,
    //             message: "Employee added successfully",
    //             employee: {
    //                 id: newEmployee._id,
    //                 EmployeeCode: newEmployee.EmployeeCode,
    //                 Name: newEmployee.Name,
    //                 Email: newEmployee.Email,
    //                 Designation: newEmployee.Designation,
    //                 Role: newEmployee.Role,
    //                 AssignedStore: newEmployee.AssignedStore,
    //                 AssignedHub: newEmployee.AssignedHub,
    //                 ProfilePhoto: newEmployee.ProfilePhoto,
    //                 Documents: newEmployee.Documents,
    //                 AssignedFOC: newEmployee.AssignedFOC
    //             },
    //             token
    //         });
    //     } catch (error) {
    //         console.error("Error adding employee:", error);
    //         return res.status(500).json({ error: error.message || "Internal server error" });
    //     }
    // }

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
                    AssignedHub: employee.AssignedHub,
                    AssignedFOC: employee.AssignedFOC
                },
                token
            });
        } catch (error) {
            console.error("Employee login error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }




 // Enhanced addEmployee method with better file handling
  async addEmployee(req, res) {
    try {
      console.log("=== ADD EMPLOYEE START ===")
      console.log("req.body:", req.body)
      console.log("req.files:", req.files)

      const {
        Name,
        Email,
        Password,
        PhoneNumber,
        Department,
        Designation,
        AssignedStore,
        AssignedHub,
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
        Status,
        AssignedFOC,
      } = req.body

      // Check if email already exists
      const existingEmployee = await Employeemodel.findOne({ Email })
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }

      // Validate required fields
      if (!Name || !Name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        })
      }

      if (!Department) {
        return res.status(400).json({
          success: false,
          message: "Department is required",
        })
      }

      // Handle profile photo
      let ProfilePhoto = null
      if (req.files && req.files.ProfilePhoto && req.files.ProfilePhoto.length > 0) {
        ProfilePhoto = req.files.ProfilePhoto[0].filename
        console.log("Profile photo filename:", ProfilePhoto)
      }

      // Handle document files
      let Documents = []
      if (req.files && req.files.Documents && req.files.Documents.length > 0) {
        Documents = req.files.Documents.map((file) => file.filename)
        console.log("Document filenames:", Documents)
      }

      // Process AssignedStore
      let processedAssignedStore = []
      if (AssignedStore) {
        if (Array.isArray(AssignedStore)) {
          processedAssignedStore = AssignedStore
        } else {
          processedAssignedStore = [AssignedStore]
        }
      }

      // Process AssignedHub
      let processedAssignedHub = []
      if (AssignedHub) {
        if (AssignedHub === "") {
          processedAssignedHub = []
        } else if (Array.isArray(AssignedHub)) {
          processedAssignedHub = AssignedHub
        } else {
          processedAssignedHub = [AssignedHub]
        }
      }

      // Create new employee
      const newEmployee = new Employeemodel({
        ProfilePhoto,
        Name,
        Email,
        Password: Password || "123456",
        PhoneNumber,
        Department,
        Designation,
        AssignedStore: processedAssignedStore,
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
        Documents,
        AssignedFOC,
      })

      console.log("New employee object created:", newEmployee)

      // Set role based on designation
      if (newEmployee.setRoleFromDesignation) {
        newEmployee.setRoleFromDesignation()
      }

      // Save employee
      await newEmployee.save()

      // Generate JWT token
      const token = jwt.sign({ userId: newEmployee._id, userType: "employee" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      })

      console.log("Employee created successfully:", newEmployee._id)
      console.log("=== ADD EMPLOYEE END ===")

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
          Documents: newEmployee.Documents,
          AssignedFOC: newEmployee.AssignedFOC,
        },
        token,
      })
    } catch (error) {
      console.error("=== ADD EMPLOYEE ERROR ===")
      console.error("Error adding employee:", error)
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      })
    }
  }

  // Add employee with pre-uploaded files (JSON only)
  async addEmployeeWithFiles(req, res) {
    try {
      console.log("=== ADD EMPLOYEE WITH FILES START ===")
      console.log("req.body:", req.body)

      const {
        Name,
        Email,
        Password,
        PhoneNumber,
        Department,
        Designation,
        AssignedStore,
        AssignedHub,
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
        Status,
        AssignedFOC,
        ProfilePhoto,
        Documents,
      } = req.body

      // Check if email already exists
      const existingEmployee = await Employeemodel.findOne({ Email })
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }

      // Validate required fields
      if (!Name || !Name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        })
      }

      if (!Department) {
        return res.status(400).json({
          success: false,
          message: "Department is required",
        })
      }

      // Process arrays
      let processedAssignedStore = []
      if (AssignedStore) {
        processedAssignedStore = Array.isArray(AssignedStore) ? AssignedStore : [AssignedStore]
      }

      let processedAssignedHub = []
      if (AssignedHub) {
        if (AssignedHub === "") {
          processedAssignedHub = []
        } else {
          processedAssignedHub = Array.isArray(AssignedHub) ? AssignedHub : [AssignedHub]
        }
      }

      let processedDocuments = []
      if (Documents) {
        processedDocuments = Array.isArray(Documents) ? Documents : [Documents]
      }

      // Create new employee
      const newEmployee = new Employeemodel({
        ProfilePhoto,
        Name,
        Email,
        Password: Password || "123456",
        PhoneNumber,
        Department,
        Designation,
        AssignedStore: processedAssignedStore,
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
        Documents: processedDocuments,
        AssignedFOC,
      })

      // Set role based on designation
      if (newEmployee.setRoleFromDesignation) {
        newEmployee.setRoleFromDesignation()
      }

      // Save employee
      await newEmployee.save()

      // Generate JWT token
      const token = jwt.sign({ userId: newEmployee._id, userType: "employee" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      })

      console.log("Employee with files created successfully:", newEmployee._id)
      console.log("=== ADD EMPLOYEE WITH FILES END ===")

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
          Documents: newEmployee.Documents,
          AssignedFOC: newEmployee.AssignedFOC,
        },
        token,
      })
    } catch (error) {
      console.error("=== ADD EMPLOYEE WITH FILES ERROR ===")
      console.error("Error:", error)
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      })
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
                Password, Status, AssignedFOC
            } = req.body;

            console.log('Update request body:', req.body);
            console.log('Update files:', req.files);

            // Create update object
            const updateData = {
                Name, Email, PhoneNumber, Department, Designation, AssignedStore,
                JoinDate, Education, Address, Country, State, City, PinCode,
                EmergencyContact, BloodGroup, AccountNumber, IFSCCode, BankName, Branch,
                Status, AssignedFOC
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


            // Handle AssignedStore (support multiple)
            if (AssignedStore !== undefined) {
                if (AssignedStore === '' || (Array.isArray(AssignedStore) && AssignedStore.length === 1 && AssignedStore[0] === '')) {
                    updateData.AssignedStore = [];
                } else if (Array.isArray(AssignedStore)) {
                    updateData.AssignedStore = AssignedStore;
                } else {
                    updateData.AssignedStore = [AssignedStore];
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



 async uploadProfilePhoto(req, res) {
    try {
      console.log("=== UPLOAD PROFILE PHOTO CONTROLLER START ===")
      console.log("req.file:", req.file)
      console.log("req.files:", req.files)
      console.log("req.body:", req.body)

      // Set JSON response headers
      res.setHeader("Content-Type", "application/json")

      // Check if file was uploaded
     if (!ProfilePhoto) {
  return res.status(400).json({
    success: false,
    message: "No file uploaded. Make sure to use field name 'ProfilePhoto'",
  });
}

      const ProfilePhoto = req.file
      console.log("File details:", {
        fieldname: ProfilePhoto.fieldname,
        originalname: ProfilePhoto.originalname,
        filename: ProfilePhoto.filename,
        mimetype: ProfilePhoto.mimetype,
        size: ProfilePhoto.size,
        path: ProfilePhoto.path,
      })

      // Validate file exists on disk
      if (!fs.existsSync(ProfilePhoto.path)) {
        console.log("File not found on disk:", ProfilePhoto.path)
        return res.status(500).json({
          success: false,
          message: "File upload failed - file not saved",
        })
      }

      console.log("Profile photo upload successful")
      console.log("=== UPLOAD PROFILE PHOTO CONTROLLER END ===")

      return res.status(200).json({
        success: true,
        message: "Profile photo uploaded successfully",
        filename: ProfilePhoto.filename,
        originalName: ProfilePhoto.originalname,
        size: ProfilePhoto.size,
        mimetype: ProfilePhoto.mimetype,
        path: ProfilePhoto.path,
      })
    } catch (error) {
      console.error("=== UPLOAD PROFILE PHOTO ERROR ===")
      console.error("Error details:", error)

      res.setHeader("Content-Type", "application/json")
      return res.status(500).json({
        success: false,
        message: "Internal server error during photo upload",
        error: error.message,
      })
    }
  }

  // Upload document with better error handling
  async uploadDocument(req, res) {
    try {
      console.log("=== UPLOAD DOCUMENT CONTROLLER START ===")
      console.log("req.file:", req.file)
      console.log("req.files:", req.files)
      console.log("req.body:", req.body)

      res.setHeader("Content-Type", "application/json")

      if (!req.file) {
        console.log("No file found in req.file")
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Make sure to use field name 'file'",
          receivedFields: req.files ? Object.keys(req.files) : [],
        })
      }

      const file = req.file
      console.log("File details:", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      })

      // Validate file exists on disk
      if (!fs.existsSync(file.path)) {
        console.log("File not found on disk:", file.path)
        return res.status(500).json({
          success: false,
          message: "File upload failed - file not saved",
        })
      }

      console.log("Document upload successful")
      console.log("=== UPLOAD DOCUMENT CONTROLLER END ===")

      return res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
      })
    } catch (error) {
      console.error("=== UPLOAD DOCUMENT ERROR ===")
      console.error("Error details:", error)

      res.setHeader("Content-Type", "application/json")
      return res.status(500).json({
        success: false,
        message: "Internal server error during document upload",
        error: error.message,
      })
    }
  }


  // Add employee with pre-uploaded files
  async addEmployeeWithFiles(req, res) {
    try {
      const {
        Name,
        Email,
        Password,
        PhoneNumber,
        Department,
        Designation,
        AssignedStore,
        AssignedHub,
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
        Status,
        AssignedFOC,
        ProfilePhoto,
        Documents,
      } = req.body

      console.log("===== ADD EMPLOYEE WITH FILES DEBUG START =====")
      console.log("req.body:", req.body)
      console.log("ProfilePhoto:", ProfilePhoto)
      console.log("Documents:", Documents)
      console.log("===== ADD EMPLOYEE WITH FILES DEBUG END =====")

      // Check if email already exists
      const existingEmployee = await Employeemodel.findOne({ Email })
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }

      // Validate required fields
      if (!Name || !Name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        })
      }

      if (!Department) {
        return res.status(400).json({
          success: false,
          message: "Department is required",
        })
      }

      if (!ProfilePhoto) {
        return res.status(400).json({
          success: false,
          message: "Profile photo is required",
        })
      }

      // Determine status based on who's creating the employee
      let finalStatus = Status || "Active"
      if (req.user && req.user.role === "siteManager") {
        finalStatus = "Pending"
      }

      // Handle AssignedHub (support for multiple hubs)
      let processedAssignedHub = []
      if (AssignedHub) {
        if (AssignedHub === "") {
          processedAssignedHub = []
        } else if (Array.isArray(AssignedHub)) {
          processedAssignedHub = AssignedHub
        } else {
          processedAssignedHub = [AssignedHub]
        }
      }

      // Normalize AssignedStore to always be an array
      let processedAssignedStore = []
      if (AssignedStore) {
        if (Array.isArray(AssignedStore)) {
          processedAssignedStore = AssignedStore
        } else {
          processedAssignedStore = [AssignedStore]
        }
      }

      // Process Documents array
      let processedDocuments = []
      if (Documents) {
        if (Array.isArray(Documents)) {
          processedDocuments = Documents
        } else {
          processedDocuments = [Documents]
        }
      }

      // Create new employee instance
      const newEmployee = new Employeemodel({
        ProfilePhoto,
        Name,
        Email,
        Password: Password || "123456",
        PhoneNumber,
        Department,
        Designation,
        AssignedStore: processedAssignedStore,
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
        Status: finalStatus,
        Documents: processedDocuments,
        AssignedFOC,
      })

      console.log("New employee object:", newEmployee)

      // Set role based on designation
      newEmployee.setRoleFromDesignation()

      // Save employee to database
      await newEmployee.save()

      // Generate JWT token
      const token = jwt.sign({ userId: newEmployee._id, userType: "employee" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      })

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
          Documents: newEmployee.Documents,
          AssignedFOC: newEmployee.AssignedFOC,
        },
        token,
      })
    } catch (error) {
      console.error("Error adding employee with files:", error)
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      })
    }
  }

    async uploadProfilePhoto(req, res) {
    try {
      console.log("=== UPLOAD PROFILE PHOTO DEBUG START ===")
      console.log("Request method:", req.method)
      console.log("Request headers:", req.headers)
      console.log("Request body:", req.body)
      console.log("Request files:", req.files)
      console.log("Request params:", req.params)
      console.log("Request query:", req.query)

      // Set proper JSON response headers
      res.setHeader("Content-Type", "application/json")

      if (!req.files) {
        console.log("No files in request")
        return res.status(400).json({
          success: false,
          message: "No files uploaded - req.files is null/undefined",
        })
      }

      if (!req.files.file) {
        console.log("No 'file' field in req.files")
        console.log("Available fields:", Object.keys(req.files))
        return res.status(400).json({
          success: false,
          message: "No file field found in upload",
          availableFields: Object.keys(req.files),
        })
      }

      const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file
      console.log("File object:", file)

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File object is null or undefined",
        })
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
        console.log("Invalid file type:", file.mimetype)
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        return res.status(400).json({
          success: false,
          message: "Only JPEG, JPG and PNG files are allowed",
          receivedType: file.mimetype,
        })
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size && file.size > maxSize) {
        console.log("File too large:", file.size)
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        return res.status(400).json({
          success: false,
          message: "File size should be less than 5MB",
          receivedSize: file.size,
        })
      }

      console.log("File validation passed")
      console.log("=== UPLOAD PROFILE PHOTO DEBUG END ===")

      return res.status(200).json({
        success: true,
        message: "Profile photo uploaded successfully",
        filename: file.filename || file.name || `uploaded_${Date.now()}.jpg`,
        originalName: file.originalname || file.originalName || "unknown",
        size: file.size || 0,
        mimetype: file.mimetype || "unknown",
      })
    } catch (error) {
      console.error("=== UPLOAD PROFILE PHOTO ERROR ===")
      console.error("Error details:", error)
      console.error("Error stack:", error.stack)

      // Ensure JSON response even on error
      res.setHeader("Content-Type", "application/json")
      return res.status(500).json({
        success: false,
        message: "Internal server error during photo upload",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
    }
  }

  // Upload document with extensive debugging
  async uploadDocument(req, res) {
    try {
      console.log("=== UPLOAD DOCUMENT DEBUG START ===")
      console.log("Request method:", req.method)
      console.log("Request headers:", req.headers)
      console.log("Request body:", req.body)
      console.log("Request files:", req.files)

      // Set proper JSON response headers
      res.setHeader("Content-Type", "application/json")

      if (!req.files || !req.files.file) {
        console.log("No files in request")
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        })
      }

      const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file
      console.log("File object:", file)

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        return res.status(400).json({
          success: false,
          message: "Only JPEG, JPG, PNG and PDF files are allowed",
          receivedType: file.mimetype,
        })
      }

      // Validate file size (10MB limit for documents)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size && file.size > maxSize) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        return res.status(400).json({
          success: false,
          message: "File size should be less than 10MB",
          receivedSize: file.size,
        })
      }

      console.log("Document validation passed")
      console.log("=== UPLOAD DOCUMENT DEBUG END ===")

      return res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        filename: file.filename || file.name || `uploaded_${Date.now()}.jpg`,
        originalName: file.originalname || file.originalName || "unknown",
        size: file.size || 0,
        mimetype: file.mimetype || "unknown",
      })
    } catch (error) {
      console.error("=== UPLOAD DOCUMENT ERROR ===")
      console.error("Error details:", error)
      console.error("Error stack:", error.stack)

      // Ensure JSON response even on error
      res.setHeader("Content-Type", "application/json")
      return res.status(500).json({
        success: false,
        message: "Internal server error during document upload",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
    }
  }

  // Test endpoint
  async testEndpoint(req, res) {
    try {
      console.log("=== TEST ENDPOINT HIT ===")
      console.log("Request method:", req.method)
      console.log("Request headers:", req.headers)
      console.log("Request body:", req.body)
      console.log("Request files:", req.files)

      res.setHeader("Content-Type", "application/json")
      return res.status(200).json({
        success: true,
        message: "Test endpoint is working",
        timestamp: new Date().toISOString(),
        method: req.method,
        hasFiles: !!req.files,
        fileFields: req.files ? Object.keys(req.files) : [],
      })
    } catch (error) {
      console.error("Test endpoint error:", error)
      res.setHeader("Content-Type", "application/json")
      return res.status(500).json({
        success: false,
        message: "Test endpoint error",
        error: error.message,
      })
    }
  }

  // Your existing methods remain the same...
  async getEmployee(req, res) {
    try {
      const getEmployee = await Employeemodel.find({})
      if (getEmployee) {
        return res.status(200).json({ EM: getEmployee })
      } else {
        return res.status(400).json({ error: "No employees found" })
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}





  



const EmployeeController = new Employee();
module.exports = EmployeeController;