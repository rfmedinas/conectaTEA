const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('./logger');

let sequelize;
if (process.env.DB_DIALECT === 'postgres') {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: msg => logger.debug(msg),
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
    define: { underscored: true, timestamps: true },
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(process.env.DB_STORAGE || './database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: { underscored: true, timestamps: true },
  });
}
module.exports = { sequelize, Sequelize };
