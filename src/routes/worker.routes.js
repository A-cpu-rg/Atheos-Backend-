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

/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: API to manage workers
 */

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Get all workers
 *     description: Retrieves a list of all workers (restricted to management roles).
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of workers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 *   post:
 *     summary: Create a new worker
 *     description: Creates a new worker (restricted to siteManager).
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerInput'
 *     responses:
 *       201:
 *         description: Worker created successfully.
 *       400:
 *         description: Bad request.
 */

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Get a single worker
 *     description: Retrieves details of a specific worker (restricted to management roles).
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worker'
 *       404:
 *         description: Worker not found.
 *   put:
 *     summary: Update a worker
 *     description: Updates an existing worker (restricted to siteManager).
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerInput'
 *     responses:
 *       200:
 *         description: Worker updated successfully.
 *       400:
 *         description: Bad request.
 *   delete:
 *     summary: Delete a worker
 *     description: Deletes a specific worker (restricted to siteManager).
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker deleted successfully.
 *       404:
 *         description: Worker not found.
 */

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
