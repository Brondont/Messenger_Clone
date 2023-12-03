let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: process.env.ORIGIN,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized.");
    }
    return io;
  },
};
