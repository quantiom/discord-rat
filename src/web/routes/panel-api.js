const API_VERSION = 1;

module.exports = (app) => {
    app.get(`/api/v${API_VERSION}/:hwid/get_saved_rce`, (req, res) => {
        const result = app.db.prepare('SELECT * FROM saved_rce WHERE hwid = ?').get(req.params.hwid);

        if (!result) return res.status(200).send({ 'code': '', 'timesToRun': 1 });
        else return res.status(200).send({ 'code': result.code, 'timesToRun': result.times_to_run });
    });

    app.post(`/api/v${API_VERSION}/:hwid/set_saved_rce`, (req, res) => {
        console.log(req.body);
        res.status(200).send({ message: 'Success' });
    });
};
