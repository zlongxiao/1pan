let express = require('express');
const fs = require("fs");
const crypto = require('crypto')
const path = require("path");
const mongojs = require('mongojs')
var MultiStream = require('multistream')
let config = require("../config")

let uploadRouter = express.Router()
uploadRouter.get("/*", (req, res, next) => {
    var referer=req.header('Referer');
    if(referer.indexOf("simon.com")==-1 && referer.indexOf("1pan.top")==-1){
        res.sendStatus(403)
    }
    var file=req.params[0];
    md5File(path.join("uploads",file)).then((result)=>{
        res.setHeader('Content-Disposition', 'attachment; filename=' + result);
        res.setHeader('Content-Type', "application/octet-stream");
        // res.setHeader('Content-Length', value.size);
        var filestream = fs.createReadStream(path.join("uploads",file));
        filestream.pipe(res)
    }).catch((reason)=>{
        res.sendStatus(404)
    })
})

function md5File (path) {
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