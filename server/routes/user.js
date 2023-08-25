const express = require("express");

const route = express.Router();

const userControllers = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

route.get("/m/:receiverId", isAuth, userControllers.getUserMessages);

route.post("/send-message", isAuth, userControllers.postUserMessage);

route.get("/userContacts/:userId", isAuth, userControllers.getContacts);

route.get("/usersSearch/:userName", isAuth, userControllers.getUsersSearched);

route.post("/addFriend/:friendId", isAuth, userControllers.postAddFriend);

route.put("/addFriend/:");

module.exports = route;
