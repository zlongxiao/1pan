var uuid = require("node-uuid");
// var moment = require("moment");
// const bs58 = require("bs58");
// const cheerio = require("cheerio");

// const rp = require("request-promise");

// let mmm = require('mmmagic');
// let Magic = mmm.Magic;
// let magic = new Magic(mmm.MAGIC_MIME_TYPE);


exports.randomString = function (len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var rStr = '';
    for (i = 0; i < len; i++) {
        rStr += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return rStr;
};

exports.random = function (len) {
    var rStr = "";
    var $chars = '0123456789';
    var maxPos = $chars.length;
    for (var j = 0; j < len; j++) {
        rStr += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return rStr;
};

function no_uuid() {
    var _uuid = uuid.v4();
    return _uuid;
}

//检查手机号码格式是否正确
exports.checkMobile = function (str) {
    let reg = /^1[0-9]{10}$/i;
    return reg.test(str);
};

// 缺损手机号
exports.checkDefectiveMobile = function (str) {
    let reg = /^1[0-9]{2}[*]{4}[0-9]{4}$/i;
    return reg.test(str);
};

// 获取缺损的手机号
exports.getDefectiveMobile = function (str) {
    return str.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
};

// 验证邮箱格式是否正确
exports.checkEmail = function (str) {
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);
};

//密码验证规则
exports.checkPassword = function (str) {
    var reg = /^(?=.*\d)(?=.*[a-z])[a-zA-Z\d]{8,16}$/;
    return reg.test(str);
};

//支付密码验证规则
exports.checkPayPassword = function (str) {
    var reg = /^\d{6}$/;
    return reg.test(str);
};

//验证码格式验证
exports.checkVCode = function (str) {
    var reg = /[0-9]{6}/;
    return reg.test(str);
};

//in_array
exports.in_array = function (search, array) {
    for (var i in array) {
        if (array[i] == search) {
            return true;
        }
    }
    return false;
};

//生成订单
exports.makeDingdannum = function () {
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth();//得到月份
    var date = now.getDate();//得到日期
    var hour = now.getHours();//得到小时
    var minu = now.getMinutes();//得到分钟
    var sec = now.getSeconds();//得到秒
    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;
    var rand = parseInt(Math.random() * 1000000000).toString().substr(0, 5);//六位随机码
    var nowdate = String(year) + '' + String(month) + '' + String(date) + '' + String(hour) + '' + String(minu) + '' + String(sec) + '' + String(rand);
    return nowdate;
};

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// exports.dateFromNow = function (date) {
//     moment.locale('zh-cn');
//     var date = moment(date);
//     return date.fromNow();
// };

// exports.nowTime = function () {
//     return moment().format("YYYY-MM-DD HH:mm:ss");
// };

exports.randomNum = function (m, n) {
    return Math.floor(Math.random() * (n - m)) + m
};

// exports.base58Encode = function (str) {
//     let bytes = Buffer.from(str)
//     return bs58.encode(bytes)
// };

// exports.base58Decode = function (str) {
//     return bs58.decode(str).toString()
// };

exports.uuid = no_uuid;

exports.removeByValue = function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
};

// exports.request_html_body = async (url, headers) => {
//     let $ = null;
//     try {
//         console.time("request_body");
//         url = encodeURI(url);
//         let opt = {
//             uri: url,
//             transform: function (body) {
//                 return cheerio.load(body);
//             }
//         };
//         if (headers) opt.headers = headers;
//         $ = await rp.get(opt);
//         console.timeEnd("request_body");
//         return $
//     } catch (e) {
//         console.log(e, "====");
//         return $
//     }
// };

exports.getFileType = async (filePath) => {
    return new Promise(function (resolve) {
        magic.detectFile(filePath, function (err, type) {
            if (err) {
                resolve(null)
                console.log("getFileType -- >", err);
                return
            }
            resolve(type)
        })
    })
}



exports.sizeFormat = function (value) {
    if (null == value || value == '') {
        return "0 Bytes";
    }
    var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2);//保留的小数位数
    return size + unitArr[index];
}

exports.dateFormat = function (fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
        ;
    }
    ;
    return fmt;
}

exports.id2time = function (id) {
    return new Date(parseInt(id.toString().substring(0, 8), 16) * 1000);
}

exports.escapeHTML = str => str.replace(/[&<>'"]/g,
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

exports.html2decode = function (encodedString) {
    if (!encodedString) return ""
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function (match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}