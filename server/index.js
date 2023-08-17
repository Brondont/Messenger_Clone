const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const db = require("./util/database");
const User = require("./models/user");
const Message = require("./models/message");
const UserMessage = require("./models/userMessage");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use(userRoutes);
app.use(authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.status || 500;
  const message = error.message;
  res.status(status).json({ error: message });
});

User.belongsToMany(Message, { through: UserMessage });
Message.belongsToMany(User, { through: UserMessage });

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
