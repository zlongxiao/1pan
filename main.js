let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
let responseTime = require('response-time')
let compress = require('compression');
let http = require('http');
const mongojs = require('mongojs')
let config = require("./config")
const router = require("./route")
const db = global.db = mongojs(config.db)


let app = express();
app.use(cookieParser())
app.use(function (req, res, next) {
    res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
    res.header('Access-Control-Allow-Origin', '*');
    // res.header("Access-Control-Allow-Headers", "*");
    // res.header('Access-Control-Request-Headers', "*");
    // res.header('Access-Control-Allow-Methods', '*');
    // res.header('Access-Control-Expose-Header', 'Authorization');
    if (req.method == "OPTIONS") {
        res.sendStatus(200)
    } else {
        next();
    }
});
app.use(responseTime())
app.use(compress());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');
app.enable('trust proxy');
// 通用的中间件

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(router.user.verify)
app.use("/upload", router.file)
app.use("/page", router.page)
app.use("/user", router.user.route)
app.use("/img", router.img)
app.use("/", router.root)


app.use(function (req, res, next) {
    let err = new Error('哦！没找到');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    if (err.status == 404) {
        return res.status(404).render("404.html");;
    }
    console.log(err)
    return res.status(200).json({code: 300, msg: '异常'});

});

http.createServer(app).listen(config.port, function () {
    console.log('Http server listening on port ' + config.port);
});

module.exports = app;