const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  "messenger-clone",
  "root",
  process.env.ROOT_PSW,
  { dialect: "mysql", host: "localhost", logging: false }
);

module.exports = sequelize;
