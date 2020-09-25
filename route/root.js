let express = require('express');
let config = require('../config');
const mongojs = require('mongojs')
let router = express.Router();
router.get("/f/:id", (req, res, next) => {
    let id = req.params["id"];
    global.db.pages.findOne({ _id: mongojs.ObjectId(id) }, (err, user) => {
        if (err || !user) {
            res.send({ r: 301 })
            return
        }
    })
});
router.get("/report", (req, res, next) => {
    config.storageip = req.ip + ":16789"
});
router.get("/ping", (req, res, next) => {
    res.json({ r: 200 })
});
router.get("/", (req, res, next) => {
    let filebase = config.filebase;
    res.render("index.html", { filebase: filebase });
});
router.post("/status", (req, res, next) => {
    if (!req.body.id || req.body.id.length < 32) {
        return res.json({ r: 301 })
    }
    global.db.devices.updateOne({ device: req.body.id },
        {
            $set: {
                natytpe: req.body.natytpe,
                ipv4: req.body.ipv4,
                ipv6: req.body.ipv6,
                internalip: req.body.internalip,
                t: new Date()
            },
        },
        { upsert: true, multi: false },
        (err, value, lastErrorObject) => {
            if (err) {
                return res.json({ r: 301 })
            }
            res.json({ r: 200, url: req.body.id })
        }
    )
});
router.post("/task", (req, res, next) => {
    if (!req.body.id || req.body.id.length < 32) {
        return res.json({ r: 301 })
    }
    let last = req.body.last
    last=mongojs.ObjectId(last)?mongojs.ObjectId(last):mongojs.ObjectId("5f49ef00d42dce788000e97d")
    global.db.tasks.findOne({ _id: { $gt: mongojs.ObjectId(last) }, "usable": true },
        (err, value) => {
            if (err) {
                return res.json({ r: 301 })
            }
            res.json({ r: 200, value: value })
        }
    )
});
router.get("/about", (req, res, next) => {
    res.render("about.html");
});
router.get("/agreement", (req, res, next) => {
    res.render("agreement.html");
});
module.exports = router;