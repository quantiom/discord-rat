const winston = require('winston');
const chalk = require('chalk');

const logger = winston.createLogger({
    transports: [new winston.transports.File({ filename: `${__dirname}/../../logs/log-${Date.now()}.log` })],
    format: winston.format.printf((log) => {
        return `[${log.level.toUpperCase()}] ${log.message}`;
    }),
});

logger.add(
    new winston.transports.Console({
        format: winston.format.printf((log) => {
            const col = log.level == 'info' ? chalk.yellow : log.level == 'error' ? chalk.red : chalk.green;
            return col(`[${log.level.toUpperCase()}]`) + chalk.white(` ${log.message}`);
        }),
    })
);

module.exports = logger;
