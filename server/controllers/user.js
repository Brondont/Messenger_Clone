const io = require("../socket");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const User = require("../models/user");
const Message = require("../models/message");
const Friend = require("../models/friend");

exports.getUserMessages = (req, res, next) => {
  const receivingUserId = req.params.receiverId;

  Message.findAll({
    attributes: ["message", "createdAt", "id", "senderId"],
    where: {
      [Op.or]: [
        { senderId: receivingUserId, receiverId: req.userId }, // Messages from user1 to user2
        { senderId: req.userId, receiverId: receivingUserId }, // Messages from user2 to user1
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
    receiverId: receiverId,
    senderId: req.userId,
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
    attributes: ["username", "id", "gender", "imagePath"],
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

exports.getUsersSearched = (req, res, next) => {
  const userSearch = req.params.userName;
  User.findAll({
    attributes: ["username", "id", "gender", "imagePath"],
    where: {
      username: {
        [Op.like]: `${userSearch}`,
      },
    },
  })
    .then((users) => {
      if (!users) {
        const error = new Error("No users found with this username");
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ users });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return err;
    });
};

exports.postAddFriend = (req, res, next) => {
  const friendId = req.params.friendId;
  Friend.findOne({ where: { friendId, userId: req.userId } })
    .then((friendRequest) => {
      if (friendRequest) {
        const error = new Error("Friend request already sent");
        error.statusCode = 403;
        throw error;
      }
      return Friend.create({
        userId: req.userId,
        friendId,
      });
    })
    .then((createdFriendRequest) => {
      if (!createdFriendRequest) {
        const error = new Error("Failed to create friend request");
        error.statusCode = 500;
        throw error;
      }
      return res.status(201).json({ message: "Friend request sent" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};

exports.putFriendRequest = (req, res, next) => {};
