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
            if (app.sockets.indexOf(socket) > -1) {
                app.sockets.splice(app.sockets.indexOf(socket), 1);
            }
        });

        socket.on('requestClients', () => {
            socket.emit('receiveClients', app.lastPings);
        });
    });

    // user agent check
    // ! CHANGE THIS LATER FOR THE PANEL WITH AUTHENTICATION !
    if (process.env.PRODUCTION == 'true') {
        app.use((req, _, next) => {
            if (req.headers['user-agent'] && req.headers['user-agent'] == config.userAgent) {
                next();
            }
        });
    }

    // logging
    //if (process.env.PRODUCTION == 'false') app.use(morgan('dev'));

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
