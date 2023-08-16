const express = require("express");

const route = express.Router();

const userControllers = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

route.get("/messages", isAuth, userControllers.getUserMessages);

route.post("/send-message", isAuth, userControllers.postUserMessage);

route.get("/userContacts/:userId", isAuth, userControllers.getContacts);

module.exports = route;
