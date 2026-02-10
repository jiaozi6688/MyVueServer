// 是所有用户都可以查看的商品数据库  商品列表
// 商品模型
// 商品模型 商品列表 所有用户都可以查看的商品数据库


const mongoose = require('mongoose');
const GoodsSchema = new mongoose.Schema({

    // 用户id用户来查询商品所属的用户
    userId: {
        type: String || Number,
        required: true,//必填字段
    },
    // 商品ID
    goodsId: {
        type: String || Number,
        required: true,//必填字段
        unique: true,//商品ID唯一 unique:true 表示商品ID不能重复
    },
    name: String,
    price: Number,
    // 商品库存
    count: Number,
    image: String,
    //商品描述
    description: {
        type: String,
        default: ''//默认值为空字符串
    },
})
module.exports = mongoose.model('Goods', GoodsSchema, 'goodslist');
