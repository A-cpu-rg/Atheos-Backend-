const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controller/auth.controller");

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("username").notEmpty(),
    body("name").notEmpty(),
    body("role").isIn([
      "client",
      "site_manager",
      "assistant_manager",
      "middle_level_manager",
      "top_level_manager",
    ]),
  ],
  authController.register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  authController.login
);

module.exports = router;
