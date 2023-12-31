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
    type: Sequelize.DATE,
  },
  type: {
    type: Sequelize.STRING,
    allowNuLL: false,
  },
});

module.exports = Friend;
