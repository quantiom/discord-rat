const db = require('better-sqlite3')(`${__dirname}/../data/db.sqlite`);
const config = require('../../config.json');

const logger = require('../util/logger');
const express = require('express');

const port = process.env.PORT || 500;
const setupRoutes = require('./routes');

module.exports = setupWeb = (app) => {
    app.db = db;
    app.lastPings = {};

    // user agent check
    /*app.use((req, _, next) => {
        if (req.headers['user-agent'] && req.headers['user-agent'] == config.userAgent) {
            next();
        }
    });*/

    // set views & view engine to ejs
    app.set('views', __dirname + '/./views');
    app.set('view engine', 'ejs');

    // public dir
    app.use(express.static(__dirname + '/./public'));

    setupRoutes(app);

    app.listen(port, () => {
        logger.info(`App listening on http://localhost:${port}.`);
    });
};
