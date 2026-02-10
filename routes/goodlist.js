const express = require('express');
const router = express.Router();
// 引入所有商品模型
const GoodsSchema = require('../models/Goods');
// 获取所有商品
router.get('/', async function (req, res, next) {
    try {
        // 使用聚合管道查询所有商品 打乱顺序
        // aggregate 聚合管道  $sample 随机采样  size 随机采样数量
        const goods = await GoodsSchema.aggregate([{ $sample: { size: 20 } }]);
        res.status(200).json({
            message: '商品列表获取成功',
            data: goods,
            code: 200
        })
    } catch (error) {
        res.status(500).json({
            message: '商品列表获取失败',
            code: 500
        })
    }
})
// 获取商品详情 根据ID
router.get('/detail/:id', async function (req, res, next) {
    // 从请求参数中获取商品ID
    const goodsId = req.params.id;
    console.log('商品ID:', goodsId);
    try {
        const goods = await GoodsSchema.findById(goodsId);
        res.status(200).json({
            message: '商品详情获取成功',
            data: goods,
            code: 200
        })
    } catch (error) {
        res.status(500).json({
            message: '商品详情获取失败',
            code: 500
        })
    }
})
module.exports = router;