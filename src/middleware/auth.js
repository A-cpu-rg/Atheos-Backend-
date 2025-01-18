const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

    // Fetch user from database using decoded token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(401).json({ message: "Not authorized to access this route" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "User role is missing" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};
