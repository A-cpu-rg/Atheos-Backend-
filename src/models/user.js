const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *         - username
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (hashed)
 *         role:
 *           type: string
 *           enum: [topManagement, middleManagement, assistantManager, siteManager, client]
 *           description: User's role in the system
 *         department:
 *           type: string
 *           enum: [HR, Admin, Accounts, Operations, None]
 *           description: User's department
 *         username:
 *           type: string
 *           description: Unique username for the user
 *         projects:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of project IDs associated with the user
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the user was last updated
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "topManagement",
        "middleManagement",
        "assistantManager",
        "siteManager",
        "client",
      ],
      required: true,
    },
    department: {
      type: String,
      enum: ["HR", "Admin", "Accounts", "Operations", "None"],
      default: "None",
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
