const io = require("../socket");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const User = require("../models/user");
const Message = require("../models/message");
const UserMessage = require("../models/userMessage");

exports.getUserMessages = (req, res, next) => {
  const receivingUserId = req.params.receiverId;

  Message.findAll({
    where: {
      "$userMessages.userId$": {
        [Op.in]: [receivingUserId, req.userId],
      },
    },
    include: {
      model: UserMessage,
      as: "userMessages",
      attributes: [], // Exclude userMessages from the result
    },
  }).then((Messages) => {
    console.log(Messages);
  });
};

exports.postUserMessage = (req, res, next) => {
  const message = req.body.message;
  const receiverId = req.body.receiverId;

  Message.create({
    message,
  })
    .then((createdMessage) => {
      return UserMessage.bulkCreate([
        { userId: req.userId, messageId: createdMessage.id },
        { userId: receiverId, messageId: createdMessage.id },
      ]);
    })
    .then(() => {
      io.getIO().emit("newMessage", req.body);
      return res.status(200).json({ message: "Message sent succesfully !" });
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
