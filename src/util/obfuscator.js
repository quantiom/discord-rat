const fs = require('fs');
const jsobfuscator = require('javascript-obfuscator');

const getObfuscatedClientCode = () => {
    const fileContents = fs.readFileSync(`${__dirname}/../web/client_code.js`, 'utf8');

    return jsobfuscator.obfuscate(fileContents, {
        compact: true,
        controlFlowFlattening: true,
        numbersToExpressions: true,
        simplify: true,
        shuffleStringArray: true,
        splitStrings: true,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        unicodeEscapeSequence: true,
        target: 'node',
    })._obfuscatedCode;
};

module.exports = { getObfuscatedClientCode };
