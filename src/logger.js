const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Define the format for log messages
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create a logger instance with specified settings
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        // Log messages will be written to bot.log file
        new transports.File({ filename: 'bot.log' })
    ],
});

module.exports = logger;