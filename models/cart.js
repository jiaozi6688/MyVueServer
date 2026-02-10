const mongoose = require('mongoose');

// 定义商品项的子Schema
const cartItemSchema = new mongoose.Schema({
    // 商品ID
    goodsId: {
        type: String,
        required: true
    },
    // 商品名称
    name: {
        type: String,
        required: true
    },
    // 商品价格
    price: {
        type: Number,
        required: true
    },
    // 商品数量
    count: {
        type: Number,
        required: true,
        min: 1
    },
    // 商品图片
    image: {
        type: String,
        required: true
    },
    // 其他可选属性
    description: {
        type: String
    }
}, {
    _id: false, // 明确禁用子文档的_id生成
    versionKey: false // 禁用__v字段
});

// 确保Schema配置正确
cartItemSchema.set('id', false); // 禁用id虚拟字段

const cartSchema = new mongoose.Schema({
    // 用户ID
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // 引用User模型
    },
    // 购物车商品数组，使用嵌套Schema定义数组元素结构
    cart: {
        type: [cartItemSchema], // 定义为cartItemSchema类型的数组
        default: [] // 购物车默认是空数组
    }
}, {
    versionKey: false // 禁用__v字段
});

// 禁用主文档的虚拟id字段
cartSchema.set('id', false);

// 导出购物车模型 cart是购物车集合
module.exports = mongoose.model('Cart', cartSchema, 'cart');