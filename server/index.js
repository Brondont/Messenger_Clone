const express = require("express");
require("dotenv").config();
const cors = require("cors");

const db = require("./util/database");
const User = require("./models/user");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(userRoutes);
app.use(authRoutes);

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
