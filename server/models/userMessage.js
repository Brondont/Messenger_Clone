const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const userMessage = sequelize.define("userMessage", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    refereneces: {
      model: "User",
      key: "id",
    },
  },
  messageId: {
    type: Sequelize.INTEGER,
    allowNulL: false,
    references: {
      model: "Message",
      key: "id",
    },
  },
});

module.exports = userMessage;
