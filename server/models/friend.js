const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Friend = sequelize.define("friend", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  confirmedAt: {
    type: Sequelize.STRING,
  },
});

module.exports = Friend;
