const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger.config");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const workerRoutes = require("./routes/worker.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const feedbackRoutes = require("./routes/feedback.routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/feedback", feedbackRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Improved MongoDB connection
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI); // Removed deprecated options
    console.log("MongoDB Connected Successfully");

    // Start server only after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to database
connectDB();
