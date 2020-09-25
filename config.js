/**
 * config
 */
let path = require("path")
let args = process.argv.splice(2)
const port = args[0] || 80;
let config;
if (process.env.Debug) {
    config = {
        debug: true,
        store_path: path.join(__dirname, "./uploads"),
        //访问page的url
        urlbase: "http://example.com",
        port: port,
        //jwt加密的私钥
        access_token: 'justtoken',
        //下载文件服务的url地址
        filebase:"download.example.com",
        db:"username:password@127.0.0.01:28018/1pan?authMechanism=SCRAM-SHA-1"
    };
} else {
    config = {
        debug: false,
        store_path: path.join(__dirname, "./uploads"),
        urlbase: "http://1pan.top",
        port: port,
        //jwt加密的私钥
        access_token: 'justtoken',
        //下载文件服务的url地址
        filebase:"download.example.com",
        //数据库配置
        db:"username:password@127.0.0.01:28018/1pan?authMechanism=SCRAM-SHA-1"
    };
}
module.exports = config;
