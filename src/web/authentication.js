const passport = require('passport');
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;

const hashPassword = (password, salt) => {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
};

module.exports = {
    setupAuthentication: (app) => {
        const { db } = app;

        passport.use(
            new LocalStrategy((username, password, done) => {
                const row = db.prepare('SELECT salt FROM panel_users WHERE username = ?').get(username);
                if (!row) return done(null, false);

                const hash = hashPassword(password, row.salt);
                const secondRow = db.prepare('SELECT username, id FROM panel_users WHERE username = ? AND password = ?').get(username, hash);

                if (!secondRow) return done(null, false);
                return done(null, secondRow);
            })
        );

        passport.serializeUser((user, done) => {
            return done(null, user.id);
        });

        passport.deserializeUser((id, done) => {
            const row = db.prepare('SELECT id, username FROM panel_users WHERE id = ?').get(id);

            if (!row) return done(null, false);
            return done(null, row);
        });
    },
    hashPassword,
};
