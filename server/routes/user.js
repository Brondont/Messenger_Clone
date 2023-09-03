const express = require("express");

const route = express.Router();

const userControllers = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

route.get("/m/:receiverId", isAuth, userControllers.getUserMessages);

route.post("/send-message", isAuth, userControllers.postUserMessage);

route.get("/userContacts/", isAuth, userControllers.getUserContacts);

route.get("/usersSearch/:userName", isAuth, userControllers.getUsersSearched);

route.post("/addFriend/:friendId", isAuth, userControllers.postAddFriend);

route.put("/addFriend/:notifierId", isAuth, userControllers.putFriendRequest);

route.get(
  "/notifications/:notifiedId",
  isAuth,
  userControllers.getUserNotifications
);

module.exports = route;
