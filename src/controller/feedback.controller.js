const Feedback = require("../models/Feedback");

// Get all feedback
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("project", "name")
      .populate("client", "name email")
      .populate("responses.responder", "name role");
    res.json(feedback);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ message: "Error fetching feedback" });
  }
};

// Get single feedback
exports.getSingleFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("project", "name")
      .populate("client", "name email")
      .populate("responses.responder", "name role");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback" });
  }
};

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { project, issue } = req.body;
    const feedback = await Feedback.create({
      project,
      client: req.user.id,
      issue,
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error creating feedback" });
  }
};

// Add response to feedback
exports.addFeedbackResponse = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const { message } = req.body;
    feedback.responses.push({
      responder: req.user.id,
      message,
    });
    await feedback.save();

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error adding response to feedback" });
  }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error updating feedback status" });
  }
};

// Escalate feedback
exports.escalateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const { escalationLevel } = req.body;
    feedback.escalationLevel = escalationLevel;
    feedback.escalationTime = new Date();
    await feedback.save();

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error escalating feedback" });
  }
};

// Mark feedback as resolved
exports.resolveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error resolving feedback" });
  }
};
