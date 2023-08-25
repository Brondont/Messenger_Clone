const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const db = require("./util/database");
const User = require("./models/user");
const Message = require("./models/message");
const Friend = require("./models/friend");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(cors());

app.use(userRoutes);
app.use(authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.status || 500;
  const message = error.message;
  res.status(status).json({ error: message });
});

User.hasMany(Message, { as: "ReceivedMessages", foreignKey: "receiverId" });
Message.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" });
User.hasMany(Message, { as: "SentMessages", foreignKey: "senderId" });
Message.belongsTo(User, { as: "Sender", foreignKey: "senderId" });
User.hasMany(Friend, { as: "FriendRequest", foreignKey: "userId" });
Friend.belongsTo(User, { as: "FriendReply", foreignKey: "friendId" });

db.sync()
  .then(() => {
    const server = app.listen(8000, (Server) => {
      console.log("server started!");
    });
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
