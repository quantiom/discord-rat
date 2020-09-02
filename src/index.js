const express = require('express');
const app = express();
const logger = require('./util/logger');

// environment variables
require('dotenv').config({ path: __dirname + '/../.env' });

// setup web stuff
require('./web/app')(app);

// ping check
setInterval(() => {
    Object.keys(app.lastPings).forEach((hwid) => {
        if (Date.now() - app.lastPings[hwid] > 60 * 1000) {
            delete app.lastPings[hwid];
            logger.info(`${hwid} has most likely disconnected, removing from client list. (no ping in 60s)`);
        }
    });
}, 1000);
