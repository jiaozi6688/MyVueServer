var jwt = require('jsonwebtoken');
// 引入userstatus模型
const UserStatus = require('../models/userstatus');

// 设置token过期时间为1天
const TOKEN_EXPIRES_IN = '1d';
// 设置token签名密钥
const TOKEN_SECRET_KEY = 'yuelei13393587702';

// 设置token
function SetToken(userInfo) {
    // 生成token
    return jwt.sign({
        phone: userInfo.phone || null,
        userId: userInfo.userId || null,
        username: userInfo.username || null,
    }, TOKEN_SECRET_KEY, {
        // 过期时间为
        // 12小时
        expiresIn: TOKEN_EXPIRES_IN
    })
}

// 验证token
async function VerifyToken(req, res, next) {
    const { userId } = req.body;
    const { token } = req.cookies;
    // 从数据库中查询userstatus表中的userId 返回的时userStatus对象符合userId的文档
    // 从数据库中查询userstatus表中的userId 返回的时userStatus对象符合userId的文档
    const userStatus = await UserStatus.findOne({ userId: userId });
    console.log(userStatus);
    // 如果userStatus不存在  则  说明token不存在
    if (!userStatus) {
        return res.status(401).json({
            message: '请重新登录',
            code: 401
        });
    }
    // 检查token是否匹配
    if (userStatus.token !== token) {
        console.log('token无效');
        return res.status(401).json({
            message: '请重新登录',
            code: 401
        });
    }
    // 检查token是否过期
    if (Date.now() > userStatus.tokenExpireTime) {
        console.log('token过期');
        // token过期执行退出函数
        return res.status(401).json({
            message: '请重新登录',
            code: 401
        });
    }

    // 如果token过期或者剩余时间不足15分钟，自动更新token
    if (Date.now() > userStatus.tokenExpireTime ||
        Date.now() + 1000 * 60 * 15 > userStatus.tokenExpireTime) {
        // 重新生成token
        const newToken = SetToken(userStatus);
        // 设置新token到cookie
        res.cookie('token', newToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        // 更新数据库中的token和过期时间
        userStatus.token = newToken;
        userStatus.tokenExpireTime = Date.now() + 1000 * 60 * 60 * 24; // 重新设置为24小时
        await userStatus.save();
        console.log('token更新成功');
    }




    jwt.verify(req.cookies.token, TOKEN_SECRET_KEY, (err, data) => {
        if (err) {
            console.log('token验证失败');
            console.log('token验证失败:', err);
            return res.status(401).json({
                message: '请重新登录',
                code: 401
            }
            );
        }

        res.status(200).json({
            message: 'token验证成功',
            code: 200,
        });
    })
}
module.exports = {
    SetToken,
    VerifyToken,
}