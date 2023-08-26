const io = require("../socket");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const User = require("../models/user");
const Message = require("../models/message");
const Friend = require("../models/friend");
const Notification = require("../models/notification");

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

exports.getUserContacts = (req, res, next) => {
  Friend.findAll({
    where: {
      type: "Accepted",
      [Op.or]: [{ userId1: req.userId }, { userId2: req.userId }],
    },
  })
    .then((friendRequests) => {
      return User.findAll({
        where: {
          [Op.or]: [
            {
              id: friendRequests.map((friendrequest) => {
                return friendrequest.userId1;
              }),
            },
            {
              id: friendRequests.map((friendrequest) => {
                return friendrequest.userId2;
              }),
            },
          ],
        },
      });
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
  const friendId = +req.params.friendId;
  const userId = +req.userId;
  if (!friendId || !userId) {
    const error = new Error("Users Id's for friend request are invalid.");
    error.statusCode = 403;
    return next(error);
  }

  let userId1;
  let userId2;
  if (friendId > userId) {
    userId1 = friendId;
    userId2 = userId;
  } else if (friendId < userId) {
    userId1 = userId;
    userId2 = friendId;
  } else {
    const error = new Error("User sending a friend request to himself.");
    error.statusCode = 403;
    return next(error);
  }

  Friend.findOne({ where: { userId1, userId2 } })
    .then((friendRequest) => {
      if (friendRequest) {
        let error;
        switch (friendRequest.type) {
          case "Pending": {
            error = new Error("Friend request already exists.");
            error.statusCode = 409;
            throw error;
          }
          case "Blocked": {
            error = new Error("You have been blocked by this user.");
            error.statusCode = 403;
            throw error;
          }
          case "Accepted": {
            error = new Error("You are already friends with this user.");
            error.statusCode = 409;
            throw error;
          }
          default: {
            error = new Error("Invalid friend request type");
            error.statusCode = 400;
            throw error;
          }
        }
      } else {
        return Friend.create({ userId1, userId2, type: "Pending" });
      }
    })
    .then((createdFriendRequest) => {
      if (!createdFriendRequest) {
        const error = new Error("Failed to create friend request");
        error.statusCode = 500;
        throw error;
      }
      return Notification.create({
        type: "Friendship",
        desc: `Friend request from ${req.username}`,
        notifiedId: friendId,
        notifierId: userId,
        seen: false,
      });
    })
    .then((createdNotification) => {
      if (!createdNotification) {
        const error = new Error("Failed to create notfication.");
        error.statusCode = 500;
        throw error;
      }
      io.getIO().emit("notification", { createdNotification });
      return res
        .status(200)
        .json({ message: "friend request sent successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};

exports.putFriendRequest = (req, res, next) => {
  const notifierId = req.params.notifierId;
  const notifiedId = req.userId;
  const reply = req.body.reply;
  if (reply !== "Accept" && reply !== "Decline") {
    const error = new Error("Invalid action type committed");
    error.statusCode = 403;
    return next(error);
  }

  if (notifierId > notifiedId) {
    userId1 = notifierId;
    userId2 = notifiedId;
  } else if (notifierId < notifiedId) {
    userId1 = notifiedId;
    userId2 = notifierId;
  } else {
    const error = new Error("User accepting friend request with himself");
    error.statusCode = 403;
    return next(error);
  }

  Friend.findOne({ where: { userId1, userId2 } })
    .then((friendRequest) => {
      if (!friendRequest) {
        const error = new Error("Friend request doesn't exist.");
        error.statusCode = 404;
        throw error;
      }
      friendRequest.confirmedAt = new Date();
      reply === "Accept"
        ? (friendRequest.type = "Accepted")
        : (friendRequest.type = "Rejected");
      return friendRequest.save();
    })
    .then(() => {
      return Notification.findOne({ where: { notifiedId, notifiedId } });
    })
    .then((notification) => {
      if (!notification) {
        const error = new Error("This notification doesn't exist");
        error.statsuCode = 404;
        throw error;
      }
      notification.seen = true;
      return notification.save();
    })
    .catch((err) => {
      throw err;
    });
};

exports.getUserNotifications = (req, res, next) => {
  const notifiedId = req.params.notifiedId;
  Notification.findAll({ where: { notifiedId } })
    .then((notifications) => {
      if (!notifications) {
        const error = new Error("No notifications found.");
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statsuCode = 500;
      }
      return next(err);
    });
};
