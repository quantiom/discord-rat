// This is the (unobfuscated) code that the user will initially run
// and will be on a unlisted pastebin, so if the host
// ever changes, I can change it easily.

const http = require('http');

const get = (url, headers) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let responseStr = '';

            res.on('data', (data) => {
                responseStr += data;
            });

            res.on('end', () => {
                resolve(responseStr.toString());
            });
        }).on('error', (e) => reject(e));
    });
};
