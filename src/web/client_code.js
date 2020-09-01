// This is the code that the client
// will run after the constant_client_code

// Export original
module.exports = require('./discord_modules.node');

// Do our own stuff
const { exec } = require('child_process');
const { createHash } = require('crypto');

const machineId = () => {
    return new Promise((resolve, reject) => {
        exec('%windir%\\System32\\REG.exe QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid', {}, (err, stdout, stderr) => {
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
        });
    });
};
