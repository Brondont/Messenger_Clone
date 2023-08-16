const bcrypt = require("bcrypt");
const path = require("path");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  let user;
  User.findOne({ where: { email } })
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error("User with this email does not exist.");
        error.statusCode = 404;
        throw error;
      }
      user = userDoc;
      return bcrypt.compare(password, userDoc.password);
    })
    .then((isCorrect) => {
      if (!isCorrect) {
        const error = new Error("User password is incorrect.");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        { userId: user.id.toString() },
        process.env.JWT_SECRET,
        {
          expiresIn: "12h",
        }
      );
      return res.status(200).json({
        message: "User successfuly logged in.",
        token,
        userId: user.id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Input validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { username, email, password, gender } = req.body;
  const imagePath =
    gender === "male"
      ? "/default-profile-pictures/male-pfp.jpg"
      : "/default-profile-pictures/female-pfp.jpg";
  User.findOne({ where: { email } })
    .then((userDoc) => {
      if (userDoc) {
        const error = new Error("User with this email already exists.");
        error.statusCode = 409;
        throw error;
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPw) => {
      return User.create({
        username,
        email,
        password: hashedPw,
        gender,
        imagePath,
      });
    })
    .then((user) => {
      return user.save();
    })
    .then((user) => {
      return res.status(200).json({ message: "User created successfully !" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};
