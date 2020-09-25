let express = require('express');
const fs = require("fs");
const crypto = require('crypto')
const path = require("path");
const mongojs = require('mongojs')
var MultiStream = require('multistream')
const fetch = require('node-fetch');
const timeoutSignal = require('timeout-signal');
let config = require("../config")
let bps = 1000 * 8000;

function speed(req, res, next) {
    if (bps > 0) {
        let total = 0;
        let resume = req.socket.resume;
        req.socket.resume = function () {
        };
        let pulse = setInterval(function () {
            total = total - bps / 100;
            if (total < bps) {
                resume.call(req.socket);
            }
        }, 10);
        req.on('data', function (chunk) {
            total += chunk.length;
            if (total >= bps) {
                req.socket.pause();
            }
        });
        req.on('end', function () {
            clearInterval(pulse);
            req.socket.resume = resume;
            req.socket.resume();
        });
    }
    next();
}

let uploadRouter = express.Router()
uploadRouter.post("/upload", speed, (req, res, next) => {
    const multiparty = require('../common/multiparty');
    var form = new multiparty.Form();
    form.uploadDir = 'tmp';
    form.maxFilesSize = 15 * 1024 * 1024;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return;
        }
        try {
            let md5 = fields["fileMd5"][0]
            let filename = fields["name"][0]
            let type = fields["type"][0]
            let size = fields["size"][0]
            let chunks = fields["chunks"][0]
            let chunk = 0;
            if (chunks > 1) {
                chunk = fields["chunk"][0]
            }
            let result = prepareFolder(md5)
            if (!result) return res.status(400).send('Bad Request');

            // doc['$addToSet'] = {thunks: chunk}
            fs.renameSync(files.file[0]["path"], path.join(config.store_path, getFolder(md5), md5 + "-" + chunk))
            global.db.temp.updateOne({md5: md5},
                {
                    $set: {
                        file: filename,
                        md5: md5,
                        size: size,
                        type: type,
                        path: path.join(config.store_path, getFolder(md5), md5)
                    },
                    $addToSet: {thunks: chunk}
                },
                {upsert: true, multi: false},
                (err, value, lastErrorObject) => {
                    if (err) {
                        return res.json({r: 301})
                    }
                    res.json({r: 200, url: md5})
                }
            )
        } catch
            (ex) {
            res.status(400).send('Bad Request')
        }
    })
    ;

});
uploadRouter.post("/img", speed, (req, res, next) => {
    const multiparty = require('../common/multiparty');
    var form = new multiparty.Form();
    form.uploadDir = 'tmp';
    form.maxFilesSize = 2 * 1024 * 1024;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return;
        }
        try {
            md5File(files.file[0]["path"]).then(function (md5) {
                let result = prepareFolder(md5)
                if (!result) return res.status(400).send('Bad Request');
                fs.renameSync(files.file[0]["path"], path.join(config.store_path, getFolder(md5), md5))
                res.json({r: 200, url: `http://${config.filebase}/img/${getFolder(md5)}/${md5}`})
            });
        } catch
            (ex) {
            res.status(400).send('Bad Request')
        }
    })
    ;

})
uploadRouter.post("/md5", (req, res, next) => {
    let md5 = req.body["fileMd5"]
    let chunk = req.body["chunk"]
    try {
        let stat = fs.statSync(path.join(config.store_path, getFolder(md5), md5 + "-" + chunk))
        res.json({"ifExist": true})
    } catch (ex) {
        res.json({"ifExist": false})
    }
})
uploadRouter.get("/download", speed, (req, res, next) => {
    // var referer=req.header('Referer');
    // if(referer.indexOf("simon.com")==-1 && referer.indexOf("1pan.top")==-1){
    //     res.sendStatus(403)
    // }
    let id = req.query["id"]
    global.db.pages.findOne(
        {_id: mongojs.ObjectId(id)},
        (err, value) => {
            if (err || !value) {
                return res.json({r: 301})
            }
            let md5 = value.file;
            global.db.temp.findOne(
                {md5: md5},
                (err, value) => {
                    let thunks = value.thunks;
                    thunks.sort(function (a,b){
                        return parseInt(a)-parseInt(b);
                    })
                    res.setHeader('Content-Disposition', 'attachment; filename=' + makeNewName(value.file, value.md5));
                    res.setHeader('Content-Type', value.type);
                    // res.setHeader('Content-Type', "application/octet-stream");
                    res.setHeader('Content-Length', value.size);

                    var streams = [];

                    thunks.forEach((item, idx) => {
                        var filestream = fs.createReadStream(value.path + "-" + item);
                        streams.push(filestream);
                    });
                    new MultiStream(streams).pipe(res)
                })
            // res.json({r: 200, url: md5})
        }
    )
})

function md5File(path) {
    return new Promise((resolve, reject) => {
        const output = crypto.createHash('md5')
        const input = fs.createReadStream(path)

        input.on('error', (err) => {
            reject(err)
        })

        output.once('readable', () => {
            resolve(output.read().toString('hex'))
        })

        input.pipe(output)
    })
}

function makeNewName(oriName, md5) {
    var extname = path.extname(oriName);
    return md5 + extname
}

function getFolder(md5) {
    if (md5.length < 32) {
        return false
    }
    let prefix = md5.substr(0, 2)
    return prefix
}

function prepareFolder(md5) {
    if (md5.length < 32) {
        return false
    }
    let prefix = getFolder(md5)
    try {
        let stat = fs.statSync(path.join(config.store_path, prefix))
    } catch (ex) {
        fs.mkdirSync(path.join(config.store_path, prefix))
    }
    return true
}

module.exports = uploadRouter