// const Project = require("../models/Project");

// // Get all projects
// exports.getProjects = async (req, res) => {
//   try {
//     const projects = await Project.find()
//       .populate("client", "name email")
//       .populate("siteManager", "name email")
//       .populate("assistantManager", "name email")
//       .populate("workers", "name contactNumber");
//     res.json(projects);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching projects" });
//   }
// };

// // Get single project
// exports.getProject = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate("client", "name email")
//       .populate("siteManager", "name email")
//       .populate("assistantManager", "name email")
//       .populate("workers", "name contactNumber");

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching project" });
//   }
// };

// // Create project
// exports.createProject = async (req, res) => {
//   try {
//     const { name, description, client, siteManager, assistantManager } =
//       req.body;
//     const project = await Project.create({
//       name,
//       description,
//       client,
//       siteManager,
//       assistantManager,
//     });
//     res.status(201).json(project);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating project" });
//   }
// };

// // Update project
// exports.updateProject = async (req, res) => {
//   try {
//     const { name, description, status } = req.body;
//     const project = await Project.findByIdAndUpdate(
//       req.params.id,
//       { name, description, status },
//       { new: true }
//     );

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating project" });
//   }
// };

// // Delete project
// exports.deleteProject = async (req, res) => {
//   try {
//     const project = await Project.findByIdAndDelete(req.params.id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     res.json({ message: "Project deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting project" });
//   }
// };

// // Add workers to project
// exports.addWorkers = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     const { workers } = req.body;
//     project.workers.push(...workers);
//     await project.save();

//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: "Error adding workers to project" });
//   }
// };

// // Remove workers from project
// exports.removeWorkers = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     const { workers } = req.body;
//     project.workers = project.workers.filter(
//       (worker) => !workers.includes(worker.toString())
//     );
//     await project.save();

//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: "Error removing workers from project" });
//   }
// };
