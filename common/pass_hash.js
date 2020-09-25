var md5 = require("md5");

exports.bhash = function (str) {
    return md5(str + 'dyj0808');
};

