const { createLogger, format, transports } = require('winston');
const path = require('path');

const logDir = process.env.LOG_DIR || './logs';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) =>
          `${timestamp} [${level}]: ${stack || message}`
        )
      ),
    }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 10,
    }),
  ],
});

module.exports = logger;
