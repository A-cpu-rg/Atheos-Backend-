const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controller/user.controller");

router.use(protect); // Protect all routes

// Get all users (restricted to management)
router.get("/", authorize("topManagement", "middleManagement"), getUsers);

// Get single user
router.get("/:id", authorize("topManagement", "middleManagement"), getUser);

// Update user
router.put("/:id", authorize("topManagement", "middleManagement"), updateUser);

// Delete user
router.delete(
  "/:id",
  authorize("topManagement", "middleManagement"),
  deleteUser
);

module.exports = router;


