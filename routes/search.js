const express = require('express');
const router = express.Router();
const goodlist = require('../models/Goods');
router.post('/', async function (req, res, next) {
    const { value } = req.body;
    console.log('从前端接收:', req.body);
    console.log('搜索关键词:', value);
    try {
        // 模糊查询
        const goods = await goodlist.find(
            {
                // `.*${value}`  表示  商品名称中  包含  搜索内容  的商品
                // $options: 'i' 表示  忽略大小写  搜索
                // $ regex 表示  正则表达式  搜索
                // .* 表示  任意字符  任意次数
                name: { $regex: `.*${value.trim()}.*`, $options: 'i' }
            }
        )

        res.status(200).json({
            message: '搜索成功',
            data: goods,
            code: 200
        });
    } catch (error) {
        console.error('搜索错误:', error);
        res.status(500).json({
            message: '服务器错误',
            code: 500
        });
    }
});
module.exports = router;
