let mysql2 = require('../proxy/db');
let config = require('../config');
let util = require('./util');
let jwt = require('jsonwebtoken');

/**
 * 用户登录状态(根据用户accesstoken)
 * @param id 用户id
 * @returns {Promise.<null>}
 */
exports.getUserByAccessToken = async function (accessToken) {
    try {
        let mysqlConn = await mysql2.getPool();
        let result = await mysqlConn.query(`select * from members where AccessToken=? AND Del=1`, [accessToken]);
        let data = result[0].length > 0 ? result[0][0] : null;
        return {success: true, msg: '获取成功', data: data};
    } catch (err) {
        console.error(err);
        return {success: false, msg: "异常"};
    }
};

/**
 * token获取获取账户数据
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getUserInfoByHeaders = async (authorization) => {
    if (!authorization) return null
    let cache = await CacheGet(authorization)
    //  不在缓存中/时间失效的时候/伪造的token
    if (!cache) {
        return null;
    }
    let id = await jwt.verify(authorization, config.access_token, function (err, decode) {
        if (err) {
            return null;
        } else {
            return decode.uid;
        }
    });
    return id;
};