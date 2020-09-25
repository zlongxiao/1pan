var request = require('request');
var config = require('../config');

var shortMessage = {
    //接口地址
    interfaceurl: "http://v.juhe.cn/sms/send",

    send: function (mobile, smsType, code, callback) {
        var data = shortMessage.get_text(mobile, smsType, code);
        shortMessage.post_data(data, function (err, result) {
            if (err) {

            } else {
                result = JSON.parse(result);
                if (result.error_code == 0) {
                    callback && callback(true);
                } else {
                    callback && callback(false);
                }
            }
        });
    },
    get_text: function (mobile, smsType, code) {
        var data = {
            tpl_id: config.sms.sms_type[smsType],
            mobile: mobile,
            tpl_value: "#code#=" + code,
            key: config.sms.key
        };
        console.log(data)
        return data;
    },

    post_data: function (data, callback) {
        request.post({
            url: shortMessage.interfaceurl,
            form: data
        }, function (err, httpResponse, body) {
            if (err) {
                console.log('shortMessage::post_data');
                console.error(err);
                callback && callback(err, false);
            } else {
                console.log(body);
                callback && callback(null, body);
            }
        });
    }
};
exports.shortMessage = shortMessage;