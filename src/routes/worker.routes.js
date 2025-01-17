const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker,
} = require("../controller/worker.controller");

router.use(protect); // Protect all routes

// Get all workers
router.get("/", authorize("siteManager", "assistantManager"), getWorkers);

// Get single worker
router.get("/:id", authorize("siteManager", "assistantManager"), getWorker);

// Create worker
router.post("/", authorize("siteManager"), createWorker);

// Update worker
router.put("/:id", authorize("siteManager"), updateWorker);

// Delete worker
router.delete("/:id", authorize("siteManager"), deleteWorker);

module.exports = router;
