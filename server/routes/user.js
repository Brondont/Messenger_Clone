const express = require("express");

const route = express.Router();

const userControllers = require("../controllers/user");

route.get("/messages", userControllers.getUserMessages);

route.post("/send-message", userControllers.postUserMessage);

module.exports = route;
