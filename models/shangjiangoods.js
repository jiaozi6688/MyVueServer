const mongoose = require('mongoose');

// 只提供给商家使用的商品模型
const ShangJiaGoodsSchema = new mongoose.Schema({
    // 用户id用户来查询商品所属的用户
    userId: {
        type: String,
        required: true,//必填字段
    },
    name: String
})
module.exports = mongoose.model('ShangJiaGoods', ShangJiaGoodsSchema,'shangjiagoodslist');