const express = require("express");
const router = express.Router();
const StoreController = require("../controller/Store");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Define the directory path
const storeDir = path.join(__dirname, "../Public/Store");

// Ensure the directory exists
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists before saving the file
    if (!fs.existsSync(storeDir)) {
      fs.mkdirSync(storeDir, { recursive: true });
    }
    cb(null, storeDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "Public/Store");
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + "_" + file.originalname);
//     },
//   });

const upload = multer({ storage: storage });

router.get("/getStore", StoreController.getStore);
router.post("/addStore", upload.single("StorePhoto"), StoreController.addStore);
router.put("/Store/:id", upload.single("StorePhoto"), StoreController.updateStore);
router.delete("/Store/:id", StoreController.deleteStore);

module.exports = router;
