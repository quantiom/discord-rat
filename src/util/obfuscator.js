const fs = require('fs');
const jsobfuscator = require('javascript-obfuscator');

const getObfuscatedCode = (code) => {
    return jsobfuscator.obfuscate(code, {
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

const getObfuscatedClientCode = () => {
    return getObfuscatedCode(fs.readFileSync(`${__dirname}/../client/client_code.js`, 'utf8'));
};

module.exports = { getObfuscatedClientCode, getObfuscatedCode };
