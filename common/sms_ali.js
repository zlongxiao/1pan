const Core = require('@alicloud/pop-core');
const config = require('../config');


let shortMessage = {
    //配置文件
    client: new Core({
        accessKeyId: config.ali_sms.accessKeyId,
        accessKeySecret: config.ali_sms.accessSecret,
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    }),
    requestOption: {
        method: 'POST'
    },

    send: function (mobile, smsType, code, callback) {
        let data = shortMessage.get_text(mobile, smsType, code);
        shortMessage.post_data(data, function (err, result) {
            if (err) {
                callback && callback(false);
            } else {
                result = JSON.parse(result);
                if (result.Code == 'OK') {
                    callback && callback(true);
                } else {
                    callback && callback(false);
                }
            }
        });
    },
    get_text: function (mobile, smsType, code) {
        let data = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": mobile,
            "SignName": config.ali_sms.signName,
            "TemplateCode": config.ali_sms.sms_type[smsType],
            "TemplateParam": '{"code":"'+code+'"}'
        };
        console.log(data)
        return data;
    },

    post_data: function (data, callback) {
        this.client.request('SendSms', data, this.requestOption).then((result) => {
            console.log(JSON.stringify(result));
            callback && callback(null, JSON.stringify(result));
        }, (ex) => {
            console.error(ex);
            callback && callback(ex, false);
        })
    }
};
exports.shortMessage = shortMessage;