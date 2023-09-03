const bcrypt = require("bcrypt");
const path = require("path");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { clearImage } = require("../util/file");

const { handleError } = require("../util/error");

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    handleError("Input validation failed", 422, errors.array());
  }

  const { email, password } = req.body;
  let user;
  User.findOne({ where: { email } })
    .then((userDoc) => {
      if (!userDoc) {
        handleError("User with this email does not exist.", 404, [
          {
            type: "Invalid",
            value: email,
            msg: "E-mail doesn't exist",
            path: "email",
            location: "body",
          },
        ]);
      }
      user = userDoc;
      return bcrypt.compare(password, userDoc.password);
    })
    .then((isCorrect) => {
      if (!isCorrect) {
        handleError("User password is incorrect", 401, [
          {
            type: "invalid",
            value: password,
            msg: "User password incorrect.",
            path: "password",
            location: "body",
          },
        ]);
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
    handleError("Input validation failed", 422, errors.array());
  }

  const { username, email, password, gender } = req.body;
  if (gender !== "male" && gender !== "female") {
    handleError("Invalid input", 403);
  }
  const imagePath =
    gender === "male"
      ? "/default-profile-pictures/male-pfp.jpg"
      : "/default-profile-pictures/female-pfp.jpg";
  User.findOne({ where: { email } })
    .then((userDoc) => {
      if (userDoc) {
        handleError("User with this email already exists.", 409, [
          {
            type: "invalid",
            value: email,
            msg: "User with this email already exists.",
            path: "email",
            location: "body",
          },
        ]);
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

  if (req.fileValidationError) {
    handleError(req, fileValidationError);
    const error = new Error(req.fileValidationError, 422, [
      {
        type: "invalid",
        value: "",
        msg: "We only support jpeg/jpg/png files.",
        path: "image",
        location: "body",
      },
    ]);
  }

  if (!errors.isEmpty()) {
    handleError("Validation failed", 422, errors.array());
  }
  const username = req.body.username;
  const gender = req.body.gender;
  let imagePath = req.body.oldPath;
  if (req.file) {
    imagePath = "/" + req.file.path;
  }
  User.findByPk(req.userId)
    .then((user) => {
      if (!user) {
        handleError("User not found.", 404);
      }
      if (user.id.toString() != req.userId) {
        handleError("Valiation failed", 403);
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
      user.imagePath = imagePath.replace("\\", "/");
      return user.save();
    })
    .then(() => {
      return res.status(201).json({ message: "Profile updated." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
