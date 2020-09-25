let express = require('express');
let bodyParser = require('body-parser');
const mongojs = require('mongojs')
const _ = require('lodash')
const config = require("../config")
const utils = require("../common/util")
let router = express.Router()
let jwt = require('jsonwebtoken');
let path = require("path")
router.post('/register', (req, res, next) => {
    let doc = { creattime: new Date(), ip: req.ip };
    let body = req.body;
    if (!body.username || !body.email || !body.password) {
        res.send({ r: 301, msg: "参数缺失" })
    }
    if (body.password != body.repassword) {
        res.send({ r: 301, msg: "两次密码不一致" })
    }
    doc.username = req.body["username"]
    doc.email = req.body["email"]
    doc.password = req.body["password"]
    doc.vip = false;
    global.db.users.insert(doc, (err, value) => {
        if (err) {
            return res.send({ r: 301, msg: "失败" })
        }
        let user = _.pick(value, ['username', 'email', "vip", "_id"]);
        res.send({ r: 200, user: user })
    });
});
router.post('/login', async (req, res, next) => {
    let body = req.body;
    if (!body.username || !body.password) {
        res.send({ r: 301, msg: "参数缺失" })
        return;
    }
    let user = global.db.users.findOne({ username: body.username, password: body.password }, (err, user) => {
        if (err || !user) {
            res.send({ r: 301 })
            return
        }
        //生成新的token
        let token = jwt.sign({ uid: user._id.toString() }, config.access_token, {
            expiresIn: 60 * 60 * 24 * 70
        });
        user.token = token;
        global.db.users.findAndModify({
            query: { _id: user._id },
            update: {
                "$set": {
                    lastip: req.ip, lasttime: new Date(), token: token
                }
            }
        }, function (err, value) { })
        user = _.pick(user, ['username', 'email', "vip", "_id", "token"]);
        res.json({ r: 200, user: user })
    });
});
router.post('/findpassword', async (req, res, next) => {
    let body = req.body;
    if (!body.email) {
        res.send({ r: 301, msg: "参数缺失" })
    }
    let user = global.db.users.findOne({ email: body.email }, (err, user) => {
        if (err || !user) {
            res.send({ r: 301 })
            return
        }

        res.send({ r: 200, email: user.email })
    });
});

router.get("/login", (req, res, next) => {
    res.render("login.html");
});
router.get("/findpasswd", (req, res, next) => {
    res.render("findpasswd.html");
});
router.get("/resetpasswd", (req, res, next) => {
    res.render("resetpasswd.html");
});
router.get("/register", (req, res, next) => {
    res.render("register.html");
});
router.get("/my", (req, res, next) => {
    if (!req.userId) {
        res.writeHead(302, { 'Location': '/' });
        res.end();
        return;
    }
    var list = [];

    global.db.pages.aggregate([
        { $match: { user: req.userId } },
        { $sort: { _id: -1 } },
        { $limit: 100 },
        { $lookup: { from: "temp", localField: "file", foreignField: "md5", as: "fileObj" } },
        { $project: { txt: 0, wx: 0, alipay: 0, "fileObj.thunks": 0, "fileObj._id": 0 } }
    ], (err, value) => {
        if (err || !value || value.length == 0) {
            res.render(path.join("my", "index.html"), { list: list });
            return;
        }
        value.forEach(function (item, idx) {
            var obj = {}
            // obj.txt = utils.html2decode(item.txt)
            obj.id = item._id;
            obj.filename = item.filename;
            obj.createtime = utils.dateFormat("YYYY-mm-dd HH:MM", utils.id2time(item._id));
            obj.secret = typeof (item.secret) == "undefined" ? false : true;
            obj.link = `${config.urlbase}\/page\/${obj.id}`;
            obj.size = utils.sizeFormat(item.fileObj[0].size);
            list.push(obj)
        })

        // global.db.temp.findOne({ md5: value.file },
        //     (err, temp) => {
        //         if (err) {
        //             return res.json({ r: 301 })
        //         }
        //         obj.size = utils.sizeFormat(temp.size);
        //         list.push(obj)
        //     }
        // )
        res.render(path.join("my", "index.html"), { list: list });
    })
});
function verify(req, res, next) {
    res.locals.uid = null;
    if (req.cookies && req.cookies.token) {
        let token = req.cookies.token;
        try {
            var decoded = jwt.verify(token, config.access_token);
            req.userId = decoded.uid;
            res.locals.uid = decoded.uid;
            next();
        } catch (err) {
            // err
            res.sendStatus(500)
        }
    } else {
        next()
    }

}
module.exports = { route: router, verify: verify }