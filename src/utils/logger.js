const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

const logDir = path.join(process.cwd(), 'logs');
fs.ensureDirSync(logDir);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'nexus-bot' },
    transports: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 10485760,
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 10485760,
            maxFiles: 5
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        })
    ],
    exitOnError: false
});

logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

const loggerWrapper = {
    info: (message, meta = {}) => {
        logger.info(message, meta);
    },
    error: (message, meta = {}) => {
        logger.error(message, meta);
    },
    warn: (message, meta = {}) => {
        logger.warn(message, meta);
    },
    debug: (message, meta = {}) => {
        logger.debug(message, meta);
    },
    log: (level, message, meta = {}) => {
        logger.log(level, message, meta);
    }
};

module.exports = loggerWrapper;
