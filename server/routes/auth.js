const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const authControllers = require("../controllers/auth");

router.post("/login", authControllers.postLogin);

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Invalid E-mail submitted"),
    check("username")
      .isLength({ min: 1 })
      .withMessage("Username not submitted"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  authControllers.postSignup
);

module.exports = router;
