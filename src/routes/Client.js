const express = require("express");
const ClientController = require("../controller/Client");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { protect, authorize } = require("../middleware/auth.js");
// const public = require("../Public/Client/Documents")
// Create separate directories for profile photos and documents
const clientDir = path.join(__dirname, "../Public/Client");
const documentsDir = path.join(__dirname, "../Public/Client/Documents");

// Ensure directories exist
[clientDir, documentsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage with separate destinations
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.fieldname === 'ProfilePhoto') {
            cb(null, clientDir);
        } else if (file.fieldname === 'Documents') {
            cb(null, documentsDir);
        }
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'ProfilePhoto') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile photo!'), false);
        }
    } else if (file.fieldname === 'Documents') {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid document format! Only images, PDFs, and Word documents are allowed.'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

// Configure upload with fields
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Configure upload fields
const uploadFields = upload.fields([
    { name: 'ProfilePhoto', maxCount: 1 },
    { name: 'Documents', maxCount: 10 }
]);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Configure routes with static file serving
router.use('/client-uploads', express.static(clientDir));
router.use('/client-documents', express.static(documentsDir));

// Public route for client login
router.post("/clientlogin", ClientController.loginClient);

// Add a specific route for client login at /api/admin/login path
router.post("", ClientController.loginClient); // This will match /api/admin/login when mounted at /api/admin

// Updated routes with proper role authorization including topManagement
router.post("/addClient", 
    protect, 
    authorize("admin", "topManagement","middleManagement"), 
    uploadFields,
    handleUploadError,
    ClientController.addClient
);

router.get("/getClient", 
    protect, 
    authorize("admin", "siteManager", "topManagement","middleManagement",""), 
    ClientController.getClient
);

router.get("/Client/:id", 
    protect,
    authorize("admin", "siteManager", "topManagement", "client","middleManagement"), 
    ClientController.getClientById
);

router.put("/Client/:id", 
    protect,
    authorize("admin", "topManagement","middleManagement"), 
    uploadFields,
    handleUploadError,
    ClientController.updateClient
);

router.delete("/Client/:id", 
    protect, 
    authorize("admin", "topManagement","middleManagement"), 
    ClientController.deleteClient
);

// Document deletion route
router.delete("/Client/:id/document/:documentName", 
    protect, 
    authorize("admin", "topManagement","middleManagement"),
    ClientController.deleteDocument
);

module.exports = router;