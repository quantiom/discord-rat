const API_VERSION = 1;

module.exports = (app) => {
    app.get(`/api/v${API_VERSION}/:hwid/get_saved_rce`, (req, res) => {
        if (req.params.hwid.length != 64) return res.status(400).send({ error: 'Invalid HWID.' });

        const result = app.db.prepare('SELECT * FROM saved_rce WHERE hwid = ?').get(req.params.hwid);

        if (!result) return res.status(200).send({ 'code': '', 'timesToRun': 1 });
        else return res.status(200).send({ 'code': result.code, 'timesToRun': result.times_to_run });
    });

    app.post(`/api/v${API_VERSION}/:hwid/set_saved_rce`, (req, res) => {
        if (req.params.hwid.length != 64) return res.status(400).send({ error: 'Invalid HWID.' });

        if (req.body.code == undefined || req.body.timesToRun == undefined) return res.status(200).send({ message: 'Invalid paramaters.' });

        const result = app.db.prepare('SELECT * FROM saved_rce WHERE hwid = ?').get(req.params.hwid);

        if (!result) {
            app.db.prepare('INSERT INTO saved_rce (hwid, code, times_to_run) VALUES (?, ?, ?)').run(req.params.hwid, req.body.code, req.body.timesToRun);
        } else {
            app.db.prepare('UPDATE saved_rce SET code = ?, times_to_run = ? WHERE hwid = ?').run(req.body.code, req.body.timesToRun, req.params.hwid);
        }

        res.status(200).send({ message: 'Success.' });
    });
};
