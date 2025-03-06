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
const Hub = require('./routes/Hub')
const Designation = require('./routes/Designation')
const Store = require('./routes/Store')
const StoreEm = require('./routes/StoreEm')
const Employee = require('./routes/Employee')
const WorkOrder = require('./routes/Workorder')
const Complaint = require('./routes/Complaint')

const Client = require("./routes/Client")
const app = express();

// Middleware
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5001"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
app.use(cors());
app.use(morgan("dev"));
// app.use("/Store",express.static("./Public/Store"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");
app.use(express.static(path.join(__dirname, "Public")));
 

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin",Hub);
app.use("/api/admin/",Designation);
app.use("/api/admin",Store);
app.use("/api/admin",StoreEm);
app.use("/api/admin",Employee)
app.use("/api/Workorder",WorkOrder)
app.use("/api/Complaint" ,Complaint)
app.use("/api/admin",Client)
// app.use("/api/admin");


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
    const PORT = 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // console.log(
      //   `Swagger documentation available at http://localhost:${f}/api-docs`
      // );
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
