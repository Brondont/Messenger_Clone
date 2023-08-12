const usermessages = [];

const io = require("../socket");

exports.getUserMessages = (req, res, next) => {
  return res.status(200).json({ messages: usermessages });
};

exports.postUserMessage = (req, res, next) => {
  usermessages.push(req.body);
  io.getIO().emit("newMessage", req.body);
  return res.status(200).json({ message: "Message sent succesfully !" });
};
