const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const authControllers = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Invalid E-mail submitted"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  authControllers.postLogin
);

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Invalid E-mail submitted"),
    check("username")
      .isLength({ min: 2 })
      .withMessage("Username must be at least 2 characters long."),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  authControllers.postSignup
);

router.put(
  "/signup",
  [
    check("username")
      .isLength({ min: 2 })
      .withMessage("Username must be at least 2 characters long."),
  ],
  isAuth,
  authControllers.putSignup
);

module.exports = router;
