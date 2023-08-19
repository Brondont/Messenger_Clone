const io = require("../socket");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const User = require("../models/user");
const Message = require("../models/message");

exports.getUserMessages = (req, res, next) => {
  const receivingUserId = req.params.receiverId;

  Message.findAll({
    attributes: ["message", "createdAt", "id", "sender_id"],
    where: {
      [Op.or]: [
        { sender_id: receivingUserId, receiver_id: req.userId }, // Messages from user1 to user2
        { sender_id: req.userId, receiver_id: receivingUserId }, // Messages from user2 to user1
      ],
    },
  })
    .then((messages) => {
      if (!messages) {
        const error = new Error("No messages found");
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ messages });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};

exports.postUserMessage = (req, res, next) => {
  const message = req.body.message;
  const receiverId = req.body.receiverId;

  Message.create({
    message,
    receiver_id: receiverId,
    sender_id: req.userId,
  })
    .then((createdMessage) => {
      io.getIO().emit("newMessage", createdMessage);
      return res.status(201).json({ message: "Message sent succesfully !" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};

exports.getContacts = (req, res, next) => {
  //implemetn added friends system to retrieve proper contacts
  //for now using all available users to complete other parts of the project
  User.findAll({
    attributes: ["email", "username", "id", "gender", "imagePath"],
  })
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
