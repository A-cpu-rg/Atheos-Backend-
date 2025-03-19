const ClientModel = require("../models/Client");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

// Define the file paths consistent with the routes
const clientDir = path.join(__dirname, "../Public/Client");
const documentsDir = path.join(__dirname, "../Public/Client/Documents");

class Client {
    // Add new client
    async addClient(req, res) {
        try {
            const {
                Name,
                Email,
                Password,
                PhoneNumber,
                Address,
                Country,
                State,
                City,
                Stores,
                Hub,
                Status
            } = req.body;

            console.log('Request body:', req.body);
            console.log('Uploaded files:', req.files);

            // Check if client with email already exists
            const existingClient = await ClientModel.findOne({ Email });
            if (existingClient) {
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

            // Create new client with schema fields
            const newClient = new ClientModel({
                ProfilePhoto,
                Name,
                Email,
                Password,
                PhoneNumber,
                Address,
                Country,
                State,
                City,
                Stores: Array.isArray(Stores) ? Stores : (Stores ? [Stores] : []),
                Hub,
                Status: Status || 'Active',
                Documents
            });

            // Save the client
            await newClient.save();

            // Generate token for immediate use
            const token = jwt.sign(
                { userId: newClient._id, userType: 'client' }, 
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                success: true,
                message: "Client added successfully",
                client: {
                    id: newClient._id,
                    ClientCode: newClient.ClientCode,
                    Name: newClient.Name,
                    Email: newClient.Email,
                    Stores: newClient.Stores,
                    Status: newClient.Status,
                    ProfilePhoto: newClient.ProfilePhoto,
                    Documents: newClient.Documents
                },
                token
            });
        } catch (error) {
            console.error("Error adding client:", error);
            if (error.code === 11000) { // MongoDB duplicate key error
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: error.message || "Internal server error" });
        }
    }

    // Client login
    async loginClient(req, res) {
        try {
            const { Email, Password } = req.body;
            console.log("Client Login Attempt:", Email);
            console.log("Request body:", req.body);
            
            if (!Email || !Password) {
                console.log("Missing email or password");
                return res.status(400).json({ error: "Email and password are required" });
            }
    
            // Find client by email
            const client = await ClientModel.findOne({ Email });
            console.log("bhjhb");
            
            if (!client) {
                console.log(`Client not found for email: ${Email}`);
                return res.status(405).json({ error: "Invalid credentials" });
            }
    
            // Check if client is active
            if (client.Status === 'Inactive') {
                console.log(`Account inactive for email: ${Email}`);
                return res.status(403).json({ error: "Account is inactive" });
            }
    
            console.log(`Client found: ${client._id}`);
            
            // Verify password
            const isMatch = await client.comparePassword(Password);
            console.log(`Password match result: ${isMatch}`);
            
            if (!isMatch) {
                console.log("Password mismatch");
                return res.status(403).json({ error: "Invalid credentials" });
            }
    
            // Generate JWT token
            const token = jwt.sign(
                { userId: client._id, userType: 'client' }, 
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
    
            console.log(`Login successful for client: ${client.Name} (${client._id})`);
    
            return res.status(200).json({
                success: true,
                message: "Login successful",
                client: {
                    id: client._id,
                    ClientCode: client.ClientCode,
                    Name: client.Name,
                    Email: client.Email,
                    Stores: client.Stores,
                    Role: 'client'
                },
                token
            });
        } catch (error) {
            console.error("Error during client login:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    

    // Get all clients
    async getClient(req, res) {
        try {
            const clients = await ClientModel.find({})
                // .select('Password'); // Exclude password from response

            if (clients) {
                return res.status(200).json({ cm: clients });
            } else {
                return res.status(400).json({ error: "No clients found" });
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update client
    async updateClient(req, res) {
        try {
            const { id } = req.params;
            
            // Find the client by id
            const client = await ClientModel.findById(id);
            if (!client) {
                return res.status(404).json({ error: "Client not found" });
            }
            
            const {
                Name,
                Email,
                Password,
                PhoneNumber,
                Address,
                Country,
                State,
                City,
                Stores,
                Hub,
                Status
            } = req.body;

            console.log('Update request body:', req.body);
            console.log('Update files:', req.files);

            // Create update object
            const updateData = {
                Name,
                Email,
                PhoneNumber,
                Address,
                Country,
                State,
                City,
                Hub,
                Status
            };

            // Update Stores if provided
            if (Stores) {
                updateData.Stores = Array.isArray(Stores) ? Stores : [Stores];
            }

            // Handle profile photo if provided
            if (req.files && req.files.ProfilePhoto && req.files.ProfilePhoto.length > 0) {
                updateData.ProfilePhoto = req.files.ProfilePhoto[0].filename;
                
                // Delete old profile photo if exists
                if (client.ProfilePhoto) {
                    const oldProfilePath = path.join(clientDir, client.ProfilePhoto);
                    if (fs.existsSync(oldProfilePath)) {
                        fs.unlinkSync(oldProfilePath);
                    }
                }
            }
            
            // Handle document files if provided
            if (req.files && req.files.Documents && req.files.Documents.length > 0) {
                // Get existing documents
                const existingDocs = client.Documents || [];
                // Add new documents
                const newDocs = req.files.Documents.map(file => file.filename);
                // Combine existing and new documents
                updateData.Documents = [...existingDocs, ...newDocs];
            }

            // Only update password if provided
            if (Password) {
                client.Password = Password;
                await client.save();
            }

            const updatedClient = await ClientModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).select('-Password');

            if (updatedClient) {
                return res.status(200).json({
                    success: true,
                    message: "Client updated successfully",
                    client: updatedClient
                });
            } else {
                return res.status(404).json({ error: "Client not found" });
            }
        } catch (error) {
            console.error("Error updating client:", error);
            return res.status(500).json({ error: error.message || "Internal server error" });
        }
    }

    // Delete client
    async deleteClient(req, res) {
        try {
            const { id } = req.params;
            const deletedClient = await ClientModel.findByIdAndDelete(id);

            if (deletedClient) {
                // Delete profile photo if exists
                if (deletedClient.ProfilePhoto) {
                    const photoPath = path.join(clientDir, deletedClient.ProfilePhoto);
                    if (fs.existsSync(photoPath)) {
                        fs.unlinkSync(photoPath);
                    }
                }
                
                // Delete all documents
                if (deletedClient.Documents && deletedClient.Documents.length > 0) {
                    deletedClient.Documents.forEach(doc => {
                        const docPath = path.join(documentsDir, doc);
                        if (fs.existsSync(docPath)) {
                            fs.unlinkSync(docPath);
                        }
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    message: "Client deleted successfully"
                });
            } else {
                return res.status(404).json({ error: "Client not found" });
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Get client by ID
    async getClientById(req, res) {
        try {
            const { id } = req.params;
            const client = await ClientModel.findById(id).select('-Password');

            if (client) {
                return res.status(200).json({
                    success: true,
                    client
                });
            } else {
                return res.status(404).json({ error: "Client not found" });
            }
        } catch (error) {
            console.error("Error fetching client by ID:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update client's hub
    async updateClientHub(req, res) {
        try {
            const { id } = req.params;
            const { Hub } = req.body;

            const updatedClient = await ClientModel.findByIdAndUpdate(
                id,
                { Hub },
                { new: true }
            ).select('-Password');

            if (updatedClient) {
                return res.status(200).json({
                    success: true,
                    message: "Client hub updated successfully",
                    client: updatedClient
                });
            } else {
                return res.status(404).json({ error: "Client not found" });
            }
        } catch (error) {
            console.error("Error updating client hub:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    
    // Delete a document from a client
    async deleteDocument(req, res) {
        try {
            const { id, documentName } = req.params;
            
            // Find the client
            const client = await ClientModel.findById(id);
            if (!client) {
                return res.status(404).json({ error: "Client not found" });
            }
            
            // Check if document exists in client's documents
            if (!client.Documents.includes(documentName)) {
                return res.status(404).json({ error: "Document not found" });
            }
            
            // Remove document from client's documents array
            client.Documents = client.Documents.filter(doc => doc !== documentName);
            await client.save();
            
            // Delete the file from filesystem
            const documentPath = path.join(documentsDir, documentName);
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

    // Create a test client with a known password
    async createTestClient(req, res) {
        try {
            // Check if test client already exists
            const existingClient = await ClientModel.findOne({ Email: "testclient@example.com" });
            if (existingClient) {
                return res.status(200).json({ 
                    message: "Test client already exists",
                    credentials: {
                        email: "testclient@example.com",
                        password: "password123"
                    }
                });
            }
            
            // Create new test client
            const newClient = new ClientModel({
                Name: "Test Client",
                Email: "testclient@example.com",
                Password: "password123", // Will be hashed by pre-save hook
                PhoneNumber: "1234567890",
                Status: "Active"
            });
            
            await newClient.save();
            
            return res.status(201).json({
                success: true,
                message: "Test client created successfully",
                credentials: {
                    email: "testclient@example.com",
                    password: "password123"
                }
            });
        } catch (error) {
            console.error("Error creating test client:", error);
            return res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
}

const ClientController = new Client();
module.exports = ClientController;