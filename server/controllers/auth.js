const bcrypt = require("bcrypt");
const path = require("path");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { clearImage } = require("../util/file");

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
        { userId: user.id.toString(), username: user.username },
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

exports.putSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }
  const username = req.body.username;
  const gender = req.body.gender;
  let imagePath = req.body.oldPath;
  if (req.file) {
    imagePath = req.file.path;
  }
  User.findByPk(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 404;
        throw error;
      }
      if (user.id.toString() != req.userId) {
        const error = new Error("Validation failed.");
        error.statusCode = 403;
        throw error;
      }
      if (
        imagePath !== "/default-profile-pictures/male-pfp.jpg" &&
        imagePath !== "/default-profile-pictures/female-pfp.jpg" &&
        imagePath !== user.imagePath
      ) {
        clearImage(user.imagePath);
      }
      user.username = username;
      user.gender = gender;
      user.imagePath = "/" + imagePath.replace("\\", "/");
      return user.save();
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
