let express = require('express');
const mongojs = require('mongojs')
const config = require('../config')
let router = express.Router()

router.get('/:id', (req, res, next) => {
    var id = req.params.id;
    if (!id) {
        res.render("404", {})
    }
    global.db.pages.findOne({_id: mongojs.ObjectId(id)}, (err, value) => {
        if (err) {
            return res.render("404", {})
        }
        var obj = {}
        obj.txt = html2decode(value.txt)
        obj.needpay = true;
        if (!value.alipay && !value.wx) {
            obj.needpay = false;
        }
        obj.alipay = value.alipay;
        obj.wx = value.wx;
        obj.id = value._id;
        obj.filename = value.filename;
        obj.createtime = dateFormat("YYYY-mm-dd HH:MM", id2time(value._id));
        if (value.user && typeof (value.user) != "undefined") {
            obj.user = value.user;
        } else {
            obj.user = "匿名用户"
        }
        obj.secret = typeof (value.secret) == "undefined" ? false : true;
        obj.filebase = config.filebase;
        global.db.temp.findOne({md5: value.file},
            (err, temp) => {
                if (err) {
                    return res.json({r: 301})
                }
                obj.size = sizeFormat(temp.size);
                res.render("detail", obj)
            }
        )
    })
});
router.post('/get', (req, res, next) => {
    var id = req.body["id"];
    var secret = req.body['secret'];
    if (!id) {
        return res.json({r: 404})
    }
    var query = {_id: mongojs.ObjectId(id)};
    global.db.pages.findOne(query, (err, value) => {
        if (err || !value) {
            return res.json({r: 404})
        }
        if (value.secret && value.secret != secret) {
            return res.json({r: 301, msg: "提取码错误"})
        }
        value.filebase = config.filebase;
        res.json({r: 200, url: `http://${config.filebase}/upload/download?id=${id}`})
    })
});
router.post('/add', (req, res, next) => {
    var doc = {}
    doc.txt = req.body["txt"]
    doc.file = req.body["file"]
    doc.wx = req.body["wx"] || ""
    doc.ip = req.ip;
    doc.filename = req.body["filename"] || "未命名";
    doc.alipay = req.body["alipay"] || ""
    doc.forcepay = req.body["forcepay"] == "true" ? true : false;
    if (doc.wx.length > 1024 * 100 || doc.alipay.length > 1024 * 100) {
        return res.json({r: 301})
    }
    if (req.body["secret"]) {
        doc.secret = req.body["secret"]
    }
    if (!doc.file) {
        return res.json({r: 301})
    }
    if(req.userId){
        doc.user=req.userId
    }
    global.db.pages.save(doc, (err, value) => {
        if (err) {
            return res.json({r: 301})
        }
        var url = `${config.urlbase}/page/${value._id}`;
        var result = `<p>请使用以下链接下载或访问文件</p><br/>
            <div class="input-group">
            <input type="text" class="form-control" id="iptUrl" value="${url}"/>
            <div class="input-group-addon" id="btnCopy">点击复制</div>
            </div>
            <br/>
            <span>右键(或长按)下面图片保存图片转发</span><br/>
            <img id="showImg" src="" style="width:20rem;height:30rem" />
            <div id="qrcodeCanvas" style="position: absolute;opacity: 0;left:-2000px">123</div>
            <canvas id="myCanvas" style="position: absolute;opacity: 0;left:-2000px"></canvas>`;
        res.json({r: 200, id: value._id, url: url, title: doc.filename, content: escapeHTML(result)})
    })
});

function sizeFormat(value) {
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

function dateFormat(fmt, date) {
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

function id2time(id) {
    return new Date(parseInt(id.toString().substring(0, 8), 16) * 1000);
}

const escapeHTML = str => str.replace(/[&<>'"]/g,
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

function html2decode(encodedString) {
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

module.exports = router