const db = require('better-sqlite3')(`${__dirname}/../data/db.sqlite`);
const config = require('../../config.json');

const logger = require('../util/logger');
const morgan = require('morgan');
const express = require('express');

const port = process.env.PORT || 500;
const setupRoutes = require('./routes');

module.exports = setupWeb = (app) => {
    app.db = db;
    app.lastPings = {};
    app.sockets = [];

    const server = require('http').createServer(app);
    const io = require('socket.io')(server);

    // add: 'clientPing', 'clientDisconnect', 'clientConnect'
    io.on('connection', (socket) => {
        app.sockets.push(socket);

        socket.on('disconnect', () => {
            app.sockets.remove(socket);
        });

        socket.on('requestClients', () => {
            socket.emit('receiveClients', app.lastPings);
        });
    });

    // user agent check
    if (process.env.PRODUCTION) {
        app.use((req, _, next) => {
            if (req.headers['user-agent'] && req.headers['user-agent'] == config.userAgent) {
                next();
            }
        });
    }

    // logging
    if (!process.env.PRODUCTION) app.use(morgan('combined'));

    // set views & view engine to ejs
    app.set('views', __dirname + '/./views');
    app.set('view engine', 'ejs');

    // public dir
    app.use(express.static(__dirname + '/./public'));

    setupRoutes(app);

    server.listen(port, () => {
        logger.info(`App listening on http://localhost:${port}.`);
    });
};
