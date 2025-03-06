const Worker = require("../models/workers");

// Get all workers
exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().populate("project", "name");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workers" });
  }
};

// Get single worker
exports.getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate(
      "project",
      "name"
    );
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: "Error fetching worker" });
  }
};

// Create worker
exports.createWorker = async (req, res) => {
  try {
    const { name, contactNumber, project, role } = req.body;
    const worker = await Worker.create({
      name,
      contactNumber,
      project,
      role,
    });
    res.status(201).json(worker);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating worker" });
  }
};

// Update worker
exports.updateWorker = async (req, res) => {
  try {
    const { name, contactNumber, role, isActive } = req.body;
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { name, contactNumber, role, isActive },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: "Error updating worker" });
  }
};

// Delete worker
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    res.json({ message: "Worker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting worker" });
  }
};
