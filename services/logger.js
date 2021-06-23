const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, colorize, printf } = format;

// Create the logger
const myFormat = printf(({ level, user, path, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level} @${path} #${user}: ${message}`;
});

module.exports = createLogger({
    format: combine(
        colorize(),
        label({ label: 'gv-scraper' }),
        timestamp(),
        myFormat
    ),
    transports: [
        new (transports.Console)({
            silent: process.env.NODE_ENV === 'test'
        }),
        new (transports.File)({
            filename: 'logs/gv-scraper.log',
            maxsize: 10000000
        })
    ]
});

