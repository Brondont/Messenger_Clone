const io = require("../socket");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const User = require("../models/user");
const Message = require("../models/message");
const Friend = require("../models/friend");
const Notification = require("../models/notification");

const { handleError } = require("../util/error");

exports.getUserMessages = (req, res, next) => {
  const receivingUserId = req.params.receiverId;
  const messageCount = +req.params.messageCount || 30;

  let allMessagesRetrieved = false;

  Message.count({
    where: {
      [Op.or]: [
        { senderId: receivingUserId, receiverId: req.userId }, // Messages from user1 to user2
        { senderId: req.userId, receiverId: receivingUserId }, // Messages from user2 to user1
      ],
    },
  })
    .then((messagesCount) => {
      allMessagesRetrieved = messageCount >= messagesCount;
      return Message.findAll({
        order: [["id", "DESC"]],
        limit: messageCount,
        attributes: ["message", "createdAt", "id", "senderId", "status"],
        where: {
          [Op.or]: [
            { senderId: receivingUserId, receiverId: req.userId }, // Messages from user1 to user2
            { senderId: req.userId, receiverId: receivingUserId }, // Messages from user2 to user1
          ],
        },
      });
    })
    .then((messages) => {
      if (!messages) {
        handleError("No messages found", 404, [
          { message: "No messages between users" },
        ]);
      }
      res.status(200).json({ messages, allMessagesRetrieved });
      io.getIO().to(receivingUserId).to(req.userId).emit("seenMessage", {
        receiverId: req.userId,
        senderId: receivingUserId, // have to flip them since the user that is making the request is the "sender" even tho he is the one that received the message
      });
      return messages.map((message) => {
        if (message.senderId.toString() === req.userId) {
          return message.save();
        }
        message.status = "seen";
        return message.save();
      });
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
    status: "sent",
    senderId: req.userId,
  })
    .then((createdMessage) => {
      if (!createdMessage) {
        handleError("Failed to create message", 500);
      }
      io.getIO()
        .to(receiverId)
        .to(req.userId)
        .emit("newMessage", createdMessage);
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
      if (friendRequests.length < 1) {
        return User.findAll({
          attributes: ["username", "id", "email", "gender", "imagePath"],
          where: { id: req.userId },
          include: [
            {
              model: Message,
              as: "SentMessages",
              limit: 1,
              order: [["id", "DESC"]],
              where: {
                [Op.or]: [{ senderId: req.userId }, { receiverId: req.userId }],
              },
            },
            {
              model: Message,
              as: "ReceivedMessages",
              limit: 1,
              order: [["id", "DESC"]],
              where: {
                [Op.or]: [{ senderId: req.userId }, { receiverId: req.userId }],
              },
            },
          ],
        });
      }
      return User.findAll({
        attributes: ["username", "id", "gender", "imagePath"],
        where: {
          id: friendRequests.flatMap((friendRequest) => {
            return [friendRequest.userId1, friendRequest.userId2];
          }),
        },
        include: [
          {
            model: Message,
            as: "SentMessages",
            limit: 1,
            order: [["id", "DESC"]],
            where: {
              [Op.or]: [{ senderId: req.userId }, { receiverId: req.userId }],
            },
          },
          {
            model: Message,
            as: "ReceivedMessages",
            limit: 1,
            order: [["id", "DESC"]],
            where: {
              [Op.or]: [{ senderId: req.userId }, { receiverId: req.userId }],
            },
          },
        ],
      });
    })
    .then((users) => {
      if (!users) {
        handleError("No users found", 404);
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
        handleError("No users found with this username", 404);
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
        switch (friendRequest.type) {
          case "Pending": {
            handleError("Friend request already exists", 409);
          }
          case "Accepted": {
            handleError("You are already friends with this user.", 409);
          }
          case "Rejected": {
            friendRequest.type = "Pending";
            friendRequest.confirmedAt = null;
            return friendRequest.save();
          }
          case "Block": {
            friendRequest.type = "Pending";
            friendRequest.confirmedAt = null;
            return friendRequest.save();
          }
          default: {
            handleError("Invalid friend request type", 400);
          }
        }
      } else {
        return Friend.create({ userId1, userId2, type: "Pending" });
      }
    })
    .then((createdFriendRequest) => {
      if (!createdFriendRequest) {
        handleError("Failed to create friend request", 500);
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
        handleError("Failed to create notification", 500);
      }
      io.getIO()
        .to(friendId.toString())
        .emit("newFriendRequestNotif", createdNotification);
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
        handleError("Friend request doesn't exist", 404);
      }
      if (friendRequest.confirmedAt) {
        return friendRequest;
      }
      friendRequest.confirmedAt = new Date();
      reply === "Accept"
        ? (friendRequest.type = "Accepted")
        : (friendRequest.type = "Rejected");
      return friendRequest.save();
    })
    .then(() => {
      return Notification.findOne({
        where: { notifiedId, notifierId, type: "Friendship" },
        order: [["createdAt", "DESC"]],
      });
    })
    .then((notification) => {
      if (!notification) {
        handleError("This notification doesn't exist", 404);
      }
      notification.seen = true;
      return notification.save();
    })
    .then(() => {
      User.findAll({
        where: { id: [notifiedId, notifierId] },
        attributes: ["username", "id", "gender", "imagePath"],
        include: [
          {
            model: Message,
            as: "SentMessages",
            limit: 1,
            order: [["id", "DESC"]],
            where: {
              [Op.or]: [{ senderId: req.userId }, { receiverId: req.userId }],
            },
          },
          {
            model: Message,
            as: "ReceivedMessages",
            limit: 1,
            order: [["id", "DESC"]],
            where: {
              [Op.or]: [{ senderId: req.userId }, { receiverId: req.userId }],
            },
          },
        ],
      })
        .then((users) => {
          if (!users) {
            handleError("Notified user doesn't exist", 404);
          }
          let notifiedUser;
          let notifyingUser;
          users.map((user) => {
            if (user.id.toString() === notifierId) {
              notifyingUser = user;
            } else {
              notifiedUser = user;
            }
          });
          if (reply === "Accept") {
            io.getIO()
              .to(notifyingUser.id.toString())
              .emit("friendAccept", notifiedUser);
            io.getIO()
              .to(notifiedUser.id.toString())
              .emit("friendAccept", notifyingUser);
          }
          return Notification.create({
            type: "FriendshipReply",
            desc:
              reply === "Accept"
                ? `${notifiedUser.username} Accepted ur friend request.`
                : `${notifiedUser.username} Rejected ur friend request.`,
            notifiedId: notifierId,
            notifierId: notifiedId,
            seen: false,
          });
        })
        .then((createdNotification) => {
          return io
            .getIO()
            .to(notifierId.toString())
            .emit("friendshipReply", createdNotification);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      throw err;
    });
};

exports.putRemoveFriend = (req, res, next) => {
  const { friendId, type } = req.body;
  if (type !== "Unfriend" && type !== "Block") {
    const error = new Error("Invalid friend operation");
    error.statusCode = 403;
    return next(error);
  }

  let userId1;
  let userId2;
  if (friendId > req.userId) {
    userId1 = friendId;
    userId2 = req.userId;
  } else if (friendId < req.userId) {
    userId1 = req.userId;
    userId2 = friendId;
  } else {
    const error = new Error("User unfriending himself");
    error.statusCode = 403;
    return next(error);
  }

  Friend.findOne({ where: { userId1, userId2 } })
    .then((friendRequest) => {
      if (!friendRequest) {
        handleError("You aren't friends with this user.", 404);
      }
      if (type === "Unfriend") {
        return friendRequest.destroy();
      } else {
        friendRequest.type = type;
        return friendRequest.save();
      }
    })
    .then(() => {
      return User.findAll({
        where: { id: [friendId, req.userId] },
        attributes: ["username", "id", "gender", "imagePath"],
      });
    })
    .then((usersDoc) => {
      io.getIO()
        .to(friendId.toString())
        .to(req.userId)
        .emit("friendRemove", usersDoc);
      return res.status(200).json();
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};

exports.getUserNotifications = (req, res, next) => {
  const notifiedId = req.params.notifiedId;
  if (req.userId !== notifiedId) {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    return next(error);
  }
  Notification.findAll({ where: { notifiedId } })
    .then((notifications) => {
      if (!notifications) {
        handleError("No notifications found.", 404);
      }
      res.status(200).json({ notifications });
      return notifications.forEach((notif) => {
        if (notif.type === "Friendship") {
          return notif;
        }
        notif.seen = true;
        return notif.save();
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statsuCode = 500;
      }
      return next(err);
    });
};
