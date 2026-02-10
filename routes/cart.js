const express = require('express');
const router = express.Router();
// 引入购物车模型是属于用户的购物车模型
const Cart = require('../models/cart');
// 引入商品模型包含商品ID、名称、价格、库存、图片、描述，用户ID，用来储存用户添加到购物车的商品信息
// 更方便到商城的主页展示不同的数据
const Goods = require('../models/Goods');
// const { loginCheckMiddleware } = require('../midfile/loginMiddleware');

// 获取用户购物车信息
router.get('/list/:userId', async (req, res) => {
    console.log('获取购物车列表请求参数:', req.params);
    try {
        const { userId } = req.params;

        console.log('用户ID:', userId);
        // 查询用户购物车 用userId来查询购物车是否属于当前用户，拿到用户购物车信息
        let cart = await Cart.findOne({ userId });
        console.log('查询到的购物车cart:', cart);

        // 如果购物车不存在，创建一个新的购物车
        if (!cart) {
            cart = new Cart({
                userId: userId,
                cart: []
            });
            await cart.save();
            console.log('创建了新购物车:', cart);
        }

        res.status(200).json({
            success: true,
            message: '获取购物车成功',
            data: cart
        });
    } catch (error) {
        console.error('获取购物车失败:', error);
        res.status(500).json({
            success: false,
            message: '获取购物车失败',
            error: error.message
        });
    }
});

// 添加商品到购物车
router.post('/:userId/add', async (req, res) => {
    try {
        const { userId } = req.params;
        const { goodsId, name, price, count = 1, image, description } = req.body;

        // 验证必填字段
        if (!goodsId || !name || !price || !image) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段'
            })
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // 如果购物车不存在，创建一个新的
            cart = new Cart({ userId, cart: [] });
        }

        // 检查商品是否已存在于购物车中
        const existingItemIndex = cart.cart.findIndex(item => item.goodsId === goodsId);

        if (existingItemIndex > -1) {
            // 如果商品已存在，更新数量
            cart.cart[existingItemIndex].count += count;
        } else {
            // 如果商品不存在，添加到购物车/同时添加商品到goodslist
            cart.cart.push({
                goodsId,
                name,
                price,
                count,
                image,
                description
            });
            // 同时添加商品到goodslist
        }
        // 保存更新后的购物车
        await cart.save();

        res.status(200).json({
            success: true,
            message: '添加商品到购物车成功',
            data: cart
        });
    } catch (error) {
        console.error('添加商品到购物车失败:', error);
        res.status(500).json({
            success: false,
            message: '添加商品到购物车失败',
            error: error.message
        });
    }
});

// 更新购物车商品数量
router.put('/:userId/update/:goodsId', async (req, res) => {
    try {
        const { userId, goodsId } = req.params;
        const { count } = req.body;

        // 验证数量
        if (!count || count <= 0) {
            return res.status(400).json({
                success: false,
                message: '数量必须大于0'
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: '购物车不存在'
            });
        }

        // 检查商品是否存在于购物车中
        const existingItemIndex = cart.cart.findIndex(item => item.goodsId === goodsId);

        if (existingItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '商品不存在于购物车中'
            });
        }

        // 更新商品数量
        cart.cart[existingItemIndex].count = count;
        await cart.save();

        res.status(200).json({
            success: true,
            message: '更新商品数量成功',
            data: cart
        });
    } catch (error) {
        console.error('更新商品数量失败:', error);
        res.status(500).json({
            success: false,
            message: '更新商品数量失败',
            error: error.message
        });
    }
});

// 删除购物车商品
router.delete('/:userId/remove/:goodsId', async (req, res) => {
    try {
        const { userId, goodsId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: '购物车不存在'
            });
        }

        // 检查商品是否存在于购物车中
        const existingItemIndex = cart.cart.findIndex(item => item.goodsId === goodsId);

        if (existingItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '商品不存在于购物车中'
            });
        }

        // 从购物车中删除商品
        cart.cart.splice(existingItemIndex, 1);
        await cart.save();

        res.status(200).json({
            success: true,
            message: '删除商品成功',
            data: cart
        });
    } catch (error) {
        console.error('删除商品失败:', error);
        res.status(500).json({
            success: false,
            message: '删除商品失败',
            error: error.message
        });
    }
});

// 清空购物车
router.delete('/:userId/clear', async (req, res) => {
    try {
        const { userId } = req.params;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: '购物车不存在'
            });
        }

        // 清空购物车
        cart.cart = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: '清空购物车成功',
            data: cart
        });
    } catch (error) {
        console.error('清空购物车失败:', error);
        res.status(500).json({
            success: false,
            message: '清空购物车失败',
            error: error.message
        });
    }
});

module.exports = router;