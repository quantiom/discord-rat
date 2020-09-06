const fs = require('fs');
const jsobfuscator = require('javascript-obfuscator');

const getObfuscatedCode = (code) => {
    return jsobfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: false,
        numbersToExpressions: true,
        simplify: true,
        shuffleStringArray: true,
        splitStrings: true,
        unicodeEscapeSequence: true,
        target: 'node',
        reservedStrings: ['require', 'let'],
        reservedNames: ['require', 'let'],
    })._obfuscatedCode;
};

const getObfuscatedClientCode = () => {
    return getObfuscatedCode(fs.readFileSync(`${__dirname}/../client/client_code.js`, 'utf8'));
};

module.exports = { getObfuscatedClientCode, getObfuscatedCode };
