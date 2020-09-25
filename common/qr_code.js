var qr = require('qr-image');

exports.toBase64Image = function (text) {
    try {
        var svg_string = qr.imageSync(text, {type: 'png'});
        svg_string = svg_string.toString('base64');
        return svg_string
    } catch (err) {
        console.error(err);
        return null
    }
};
