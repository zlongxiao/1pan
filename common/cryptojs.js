let CryptoJS = require("crypto-js");

exports.encrypt = (message, key) => {
    let keyHex = CryptoJS.enc.Utf8.parse(key);
    let encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString()
};
exports.decrypt = (message, key) => {
    let keyHex = CryptoJS.enc.Utf8.parse(key);
    let plaintext = CryptoJS.DES.decrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return plaintext.toString(CryptoJS.enc.Utf8)
};