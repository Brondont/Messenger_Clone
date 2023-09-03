const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const db = require("./util/database");
const User = require("./models/user");
const Message = require("./models/message");
const Friend = require("./models/friend");
const Notification = require("./models/notification");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "." + file.mimetype.split("/")[1]);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    return cb(null, true);
  } else {
    req.fileValidationError = "Forbidden extension";
    return cb(null, false);
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
  const status = error.statusCode || 500;
  const message = error;
  res.status(status).json({ error: message });
});

User.hasMany(Message, { as: "ReceivedMessages", foreignKey: "receiverId" });
Message.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" });
User.hasMany(Message, { as: "SentMessages", foreignKey: "senderId" });
Message.belongsTo(User, { as: "Sender", foreignKey: "senderId" });
User.hasMany(Friend, { as: "FriendRequest", foreignKey: "userId1" });
Friend.belongsTo(User, { as: "FriendReply", foreignKey: "userId2" });
User.hasMany(Notification, { as: "Notified", foreignKey: "notifiedId" });
Notification.belongsTo(User, { as: "Notifier", foreignKey: "notifierId" });

db.sync()
  .then(() => {
    const server = app.listen(8000, (Server) => {
      console.log("server started!");
    });
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected!");
      const token = socket.handshake.query.token;

      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
          const error = new Error("Authentication failed.");
          error.statusCode = 401;
          throw error;
        }
        const userId = decodedToken.userId;

        console.log("User connected");

        socket.join(userId);

        socket.on("disconnect", (result, result2) => {
          console.log("Client disconnected!");
          socket.leave(userId);
        });
      } catch (err) {
        console.error("Authentication failed:", err);
        socket.disconnect(true);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });
