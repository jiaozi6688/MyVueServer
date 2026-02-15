const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const multer = require('multer');
const path = require('path');

// 配置multer用于处理multipart/form-data（包含文件上传）
const storage = multer.diskStorage({
    // 作用：明确指定上传文件要保存到服务器的哪个本地目录（即文件存储路径）。
    destination: function (req, file, cb) {
        // 商品图片上传到public/images/目录
        // cb是回调函数，用于将上传目录传递给multer
        cb(null, path.join(__dirname, '../public/images/'));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // 保留原始文件扩展名
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    // - storage ：使用上面定义的存储配置
    // - fileFilter ：允许上传任何类型的文件
    // - limits ：限制单个文件最大为10MB
    storage: storage,
    // 作用：允许上传任何类型的文件
    fileFilter: function (req, file, cb) {
        // 只允许jpg,jpeg,png格式的图片
        // if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        //     return cb(new Error('只允许上传jpg,jpeg,png格式的图片'), false);
        // }
        cb(null, true);
        // cb(null, false); // 拒绝文件上传
        // cb是回调函数，用于将文件是否接受传递给multer
    },
    // 作用：限制上传文件的大小，这里设置为10MB
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
    }
});

// 引入购物车模型
const Cart = require('../models/cart');
// 引入商品模型
const User = require('../models/user');
// 引入商品模型
const Goods = require('../models/Goods');
// 引入商家商品模型
const ShangJiaGoods = require('../models/shangjiangoods');
// 引入管理员中间件
const adminMiddleware = require('../midfile/adminMIddleware');

//只提供给商家使用的api接口 商家上架的商品存在商家的数据库
// ============================================
// ---------------商家上架商品-------------------
// ============================================
// 前端是在formdata中传递商品数据（包含文件）
// upload.any() 用于处理多个文件上传，文件字段名可以在req.files中访问
// 作用：处理商品上传请求，包括文件上传和表单数据解析
// adminMiddleware 是管理员中间件，用于判断用户是否是管理员
router.post('/addgoods/:userId/:role', upload.any(), adminMiddleware, async (req, res) => {
    //查询商检的货架数据库，用userId和role来查询 判断是否为商家
    const { userId, role } = req.params;
    console.log('userId:', userId);
    console.log('role:', role);
    console.log('前端传回的表单数据:', req.body);
    console.log('上传的文件:', req.files);
    try {
        // 检查用户是否存在
        // 用聚合管道查询用户和商家商品
        // aggregate() 方法用于执行聚合操作，返回一个 Promise
        // 作用：根据用户ID和角色查询用户，同时连接商家商品数据库，根据用户ID匹配商品
        const user = await User.aggregate([
            //根据用户id和角色来查询用户 查询user表中的用户
            { $match: { _id: new ObjectId(userId), role: role } },
            // 连接商家商品数据库，根据用户ID匹配商品
            {
                $lookup: {
                    from: 'shangjiangoods',//要连接的数据库
                    localField: '_id',//当前用户的id
                    foreignField: 'userId',//匹配商家商品数据库中的userId
                    as: 'shangJiaGoods'//将匹配到的商品存储在shangJiaGoods数组中
                }
            }
        ]);
        console.log('user..............:', user);
        // 检查用户是否存在
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在',
                code: 404
            });
        }
    } catch (err) {
        console.error('查询用户错误:', err);
        return res.status(500).json({
            success: false,
            message: '服务器错误',
            code: 500
        });
    }

    // 查询商家是否有购物车,如果没有购物车,则创建一个新的购物车
    let cart = await Cart.findOne({ userId: req.params.userId });
    // 如果购物车不存在，创建一个新的购物车
    if (!cart) {
        cart = new Cart({
            userId: req.params.userId,
            cart: []
        });
        await cart.save();
        console.log('创建了新购物车:', cart);
    }

    // 检查前端是否提供了goodsId
    if (!req.body.goodsId) {
        return res.status(400).json({
            success: false,
            message: '商品ID不能为空',
            code: 400
        });
    }

    // 检查商品ID是否已存在
    const  existingGoods = await ShangJiaGoods.findOne({ goodsId: req.body.goodsId });
    console.log('existingGoods:', existingGoods);
    if (existingGoods) {
        return res.status(400).json({
            success: false,
            message: '该商品ID已存在',
            code: 400
        });
    }

    // 使用前端传回的goodsId
    const goodsId = req.body.goodsId;

    // 处理文件上传 - 获取图片路径
    let imagePath = '';
    if (req.files && req.files.length > 0) {
        // 假设第一个文件是商品图片
        imagePath = '/images/' + req.files[0].filename;
    }

    //商家的商品数据库,只保存用户id和商品名称
    await ShangJiaGoods.create({
        userId: req.params.userId,
        name: req.body.name
    });

    // 添加商品到Goods数据库 就是所有商家的商品的数据库
    await Goods.create({
        userId: req.params.userId,
        goodsId: goodsId,
        name: req.body.name,
        price: req.body.price,
        count: req.body.count,
        image: imagePath, // 使用上传的图片路径
        description: req.body.description
    });

    console.log('添加商品到该用户的数据库成功');
    res.status(200).json({
        success: true,
        message: '添加商品到该用户的数据库成功',
        code: 200,
        imagePath: imagePath // 返回图片路径给前端
    });
});

module.exports = router;