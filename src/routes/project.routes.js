const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addWorkers,
  removeWorkers,
} = require("../controller/project.controller");

router.use(protect); // Protect all routes

// Get all projects
router.get("/", getProjects);

// Get single project
router.get("/:id", getProject);

// Create project (restricted to management)
router.post("/", authorize("topManagement", "middleManagement"), createProject);

// Update project
router.put(
  "/:id",
  authorize("topManagement", "middleManagement", "siteManager"),
  updateProject
);

// Delete project
router.delete(
  "/:id",
  authorize("topManagement", "middleManagement"),
  deleteProject
);

// Add workers to project
router.post("/:id/workers", authorize("siteManager"), addWorkers);

// Remove workers from project
router.delete("/:id/workers", authorize("siteManager"), removeWorkers);

module.exports = router;
