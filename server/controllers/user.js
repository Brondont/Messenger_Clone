const usermessages = [];

const io = require("../socket");

const User = require("../models/user");

exports.getUserMessages = (req, res, next) => {
  return res.status(200).json({ messages: usermessages });
};

exports.postUserMessage = (req, res, next) => {
  usermessages.push(req.body);
  io.getIO().emit("newMessage", req.body);
  return res.status(200).json({ message: "Message sent succesfully !" });
};

exports.getContacts = (req, res, next) => {
  //implemetn added friends system to retrieve proper contacts
  //for now using all available users to complete other parts of the project
  User.findAll()
    .then((users) => {
      if (!users) {
        const error = new Error("No users found.");
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ users });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};
