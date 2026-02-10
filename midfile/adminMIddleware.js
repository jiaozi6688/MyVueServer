// 判断用户是否是商家
const isShangJia = (req, res, next) => {
    const { role } = req.params;
    console.log('这是中间件req.params:',req.params);
    console.log('这是中间件role:',role);

    if (role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '只有商家才能上架商品'
        });
    }
    next();
}

module.exports = isShangJia;
