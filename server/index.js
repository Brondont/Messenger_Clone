const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user");

const app = express();

app.use(express.json());
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

const server = app.listen(8000, (Server) => {
  console.log("server started!");
});

const io = require("./socket").init(server);
io.on("connection", (socket) => {
  console.log("Client connected!");
});
