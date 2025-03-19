const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Client = require("../models/Client");
const Employee = require("../models/Employee");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from authorization header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user type from token
    if (decoded.userType === 'client') {
      // Find client
      req.user = await Client.findById(decoded.userId);
      if (req.user) {
        req.user.Role = 'client'; // Ensure role is set for client
        // Update last login time
        await Client.findByIdAndUpdate(req.user._id, { 
          LastLogin: new Date() 
        });
      }
    } else if (decoded.userType === 'employee') {
      // Find employee
      req.user = await Employee.findById(decoded.userId);
      if (req.user) {
        // Role is already set in Employee model
        // Update last login time
        await Employee.findByIdAndUpdate(req.user._id, {
          LastLogin: new Date()
        });
      }
    } else {
      // Legacy user authentication
      req.user = await User.findById(decoded.userId);
      
      // Map legacy user roles to standardized roles
      if (req.user && req.user.role) {
        if (req.user.role === 'admin') {
          req.user.Role = 'admin';
        } else if (req.user.role === 'topManagement') {
          req.user.Role = 'topManagement';
        } else if (req.user.role === 'middleManagement') {
          req.user.Role = 'middleManagement';
        } else if (req.user.role === 'assistantManager') {
          req.user.Role = 'assistantManager';
        } else if (req.user.role === 'siteManager') {
          req.user.Role = 'siteManager';
        } else {
          req.user.Role = req.user.role;
        }
      }
    }

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user/client is active
    if (req.user.Status === 'Inactive' || req.user.isActive === false) {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Not authorized to access this route" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get role (either from Role field or role field)
    const userRole = req.user.Role || req.user.role;
    
    if (!userRole) {
      return res.status(401).json({ message: "User role is missing" });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `User role ${userRole} is not authorized to access this route`,
      });
    }

    next();
  };
};
