// 登录检查中间件判断用户是否登录
// 如果用户未登录，重定向到登录页面
// 如果用户已登录，继续执行下一个中间件
module.exports = {
    loginCheckMiddleware(req, res, next) {
        if (!req.session.user) {
            res.redirect('/login');
        }
        next();
    }
}