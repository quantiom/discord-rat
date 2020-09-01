const winston = require('winston');
const chalk = require('chalk');
const moment = require('moment');

const logger = winston.createLogger({
    transports: [new winston.transports.File({ filename: `${__dirname}/../../logs/log-${Date.now()}.log` })],
    format: winston.format.printf((log) => {
        return `[${moment().utcOffset('-0400').format('MM-DD-YYYY HH:mm A')} EST] [${log.level.toUpperCase()}] ${log.message}`;
    }),
});

logger.add(
    new winston.transports.Console({
        format: winston.format.printf((log) => {
            const col = log.level == 'info' ? chalk.yellow : log.level == 'error' ? chalk.red : chalk.green;
            return (
                chalk.gray(`[${moment().utcOffset('-0400').format('MM-DD-YYYY HH:mm A')} EST] `) +
                col(`[${log.level.toUpperCase()}]`) +
                chalk.white(` ${log.message}`)
            );
        }),
    })
);

module.exports = logger;
