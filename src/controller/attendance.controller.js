const Attendance = require("../models/Attendance");

// Get attendance records
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("worker", "name")
      .populate("project", "name");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records" });
  }
};

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const attendance = await Attendance.find({
      date: {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59)),
      },
    })
      .populate("worker", "name")
      .populate("project", "name");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records" });
  }
};

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { worker, project, date, status } = req.body;
    const attendance = await Attendance.create({
      worker,
      project,
      date,
      status,
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance" });
  }
};

// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error updating attendance" });
  }
};

// Verify attendance
exports.verifyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        verifiedByClient: true,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error verifying attendance" });
  }
};

// Get project attendance report
exports.getProjectAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      project: req.params.projectId,
    })
      .populate("worker", "name")
      .populate("project", "name");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project attendance" });
  }
};
