const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_USERNAME,
  process.env.DB_NAME,
  process.env.DB_ROOT_PSW,
  { dialect: "mysql", host: process.env.DB_HOST, logging: false }
);

module.exports = sequelize;
