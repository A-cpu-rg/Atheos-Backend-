const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/auth.js");

const EmployeeController = require("../controller/Employee")

const multer = require("multer")
const fs = require("fs")
const path = require("path")

// Create separate directories for profile photos and documents
const employeeDir = path.join(__dirname, "../Public/Employee");
const documentsDir = path.join(__dirname, "../Public/Employee/Documents");

// Create directories if they don't exist
[employeeDir, documentsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
});

// Configure storage with separate destinations
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "ProfilePhoto") {
            cb(null, employeeDir);
        } else if (file.fieldname === "Documents") {
            cb(null, documentsDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "ProfilePhoto") {
        // For profile photos, only accept images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile photo!'), false);
        }
    } else if (file.fieldname === "Documents") {
        // For documents, accept common document formats
        const allowedTypes = [
            'image/jpeg', 'image/png', 'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
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
router.use('/employee-uploads', express.static(employeeDir));
router.use('/employee-documents', express.static(documentsDir));

// Public routes - no authentication required
router.post("/employeelogin", EmployeeController.loginEmployee);

// Add a specific route for employee login at /api/admin/login path
router.post("", EmployeeController.loginEmployee); // This will match /api/admin/login when mounted at /api/admin

// Route to create a test employee with known credentials
// router.post("/test-employee", EmployeeController.createTestEmployee);

// Admin routes - requires authentication and admin authorization
// router.post("/addEmployee", 
//     protect, 
//     authorize("admin", "siteManager", "topManagement","middleManagement"), 
//     uploadFields,
//     handleUploadError,
//     EmployeeController.addEmployee
// );
// In your employee routes file
router.post("/addEmployee",
    protect,
    authorize("admin", "siteManager", "topManagement", "middleManagement", "permanentReliever", "assistantManager", "housekeeper", "FOE"),
    (req, res, next) => {
        // Force Pending status for site managers
        if (req.user && req.user.role === 'siteManager') {
            req.body.Status = "Pending";
        }
        next();
    },
    uploadFields,
    handleUploadError,
    EmployeeController.addEmployee
);
router.get("/getEmployee",
    protect,
    authorize("admin", "siteManager", "topManagement", "middleManagement", "client", "assistantManager", "permanentReliever", "assistantManager", "housekeeper", "employee", "FOE"),
    EmployeeController.getEmployee
);

router.get("/Employee/:id",
    protect,
    EmployeeController.getEmployeeById
);

router.put("/Employee/:id",
    protect,
    authorize("admin", "topManagement", "assistantManager", "siteManager", "FOE"),
    uploadFields,
    handleUploadError,
    EmployeeController.updateEmployee
);

router.delete("/Employee/:id",
    protect,
    authorize("admin", "topManagement", "assistantManager", "siteManager", "FOE"),
    EmployeeController.deleteEmployee
);

// Document deletion route
router.delete("/Employee/:id/document/:documentName",
    protect,
    authorize("admin", "topManagement", "assistantManager", "siteManager"),
    EmployeeController.deleteDocument
);

// Store manager routes
router.get("/store/:storeId/employees",
    protect,
    authorize("admin", "siteManager", "topManagement", "assistantManager"),
    EmployeeController.getEmployeesByStore
);

// Hub manager routes
router.get("/hub/:hubId/employees",
    protect,
    authorize("admin", "siteManager", "topManagement", "assistantManager", "FOE"),
    EmployeeController.getEmployeesByHub
);



// New routes for separate file uploads
router.post(
    "/uploadProfilePhoto",
    protect,
    authorize("admin", "siteManager", "topManagement", "assistantManager", "FOE"),
    upload.single("ProfilePhoto"),
    EmployeeController.uploadProfilePhoto,
)
router.post(
    "/uploadDocument",
    protect,
    authorize("admin", "siteManager", "topManagement", "assistantManager", "FOE"),
    upload.fields([{ name: "Documents", maxCount: 1 }]),
    EmployeeController.uploadDocument,
)
router.post("/addEmployeeWithFiles", protect,
    authorize("admin", "siteManager", "topManagement", "assistantManager", "FOE"), EmployeeController.addEmployeeWithFiles)




module.exports = router