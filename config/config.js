require('dotenv').config();

module.exports = {
  development: {
    username: 'admin',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: "admin",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: 'admin',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'test',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  },
};