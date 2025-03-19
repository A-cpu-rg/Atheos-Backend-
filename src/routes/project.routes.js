// const express = require("express");
// const router = express.Router();
// const { protect, authorize } = require("../middleware/auth.js");
// const {
//   getProjects,
//   getProject,
//   createProject,
//   updateProject,
//   deleteProject,
//   addWorkers,
//   removeWorkers,
// } = require("../controller/project.controller");

// /**
//  * @swagger
//  * tags:
//  *   name: Projects
//  *   description: Project management endpoints
//  */

// /**
//  * @swagger
//  * /api/projects:
//  *   get:
//  *     summary: Get all projects
//  *     tags: [Projects]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of all projects
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Project'
//  *       401:
//  *         description: Not authorized
//  *       500:
//  *         description: Server error
//  */
// router.get("/", protect, getProjects);

// /**
//  * @swagger
//  * /api/projects/{id}:
//  *   get:
//  *     summary: Get a project by ID
//  *     tags: [Projects]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Project ID
//  *     responses:
//  *       200:
//  *         description: Project details
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Project'
//  *       404:
//  *         description: Project not found
//  *       500:
//  *         description: Server error
//  */
// router.get("/:id", protect, getProject);

// /**
//  * @swagger
//  * /api/projects:
//  *   post:
//  *     summary: Create a new project
//  *     tags: [Projects]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - description
//  *               - client
//  *               - siteManager
//  *               - assistantManager
//  *             properties:
//  *               name:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               client:
//  *                 type: string
//  *                 description: Client user ID
//  *               siteManager:
//  *                 type: string
//  *                 description: Site manager user ID
//  *               assistantManager:
//  *                 type: string
//  *                 description: Assistant manager user ID
//  *     responses:
//  *       201:
//  *         description: Project created successfully
//  *       403:
//  *         description: Not authorized to create projects
//  *       500:
//  *         description: Server error
//  */
// router.post(
//   "/",
//   protect,
//   authorize("topManagement", "middleManagement"),
//   createProject
// );

// /**
//  * @swagger
//  * /api/projects/{id}:
//  *   put:
//  *     summary: Update a project
//  *     tags: [Projects]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Project ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               status:
//  *                 type: string
//  *                 enum: [active, completed, suspended]
//  *     responses:
//  *       200:
//  *         description: Project updated successfully
//  *       404:
//  *         description: Project not found
//  *       403:
//  *         description: Not authorized to update projects
//  *       500:
//  *         description: Server error
//  */
// router.put(
//   "/:id",
//   protect,
//   authorize("topManagement", "middleManagement", "siteManager"),
//   updateProject
// );

// /**
//  * @swagger
//  * /api/projects/{id}/workers:
//  *   post:
//  *     summary: Add workers to a project
//  *     tags: [Projects]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Project ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - workers
//  *             properties:
//  *               workers:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 description: Array of worker IDs
//  *     responses:
//  *       200:
//  *         description: Workers added successfully
//  *       404:
//  *         description: Project not found
//  *       403:
//  *         description: Not authorized
//  *       500:
//  *         description: Server error
//  */
// router.post("/:id/workers", protect, authorize("siteManager"), addWorkers);

// /**
//  * @swagger
//  * /api/projects/{id}/workers:
//  *   delete:
//  *     summary: Remove workers from a project
//  *     tags: [Projects]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Project ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - workers
//  *             properties:
//  *               workers:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 description: Array of worker IDs to remove
//  *     responses:
//  *       200:
//  *         description: Workers removed successfully
//  *       404:
//  *         description: Project not found
//  *       403:
//  *         description: Not authorized
//  *       500:
//  *         description: Server error
//  */
// router.delete("/:id/workers", protect, authorize("siteManager"), removeWorkers);

// module.exports = router;
