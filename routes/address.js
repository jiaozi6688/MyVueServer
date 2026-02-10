const express = require('express');
const router = express.Router();
// 引入用户模型
const User = require('../models/user');
// 引入地址模型
const Address = require('../models/address');
// 添加地址
router.post('/address/:userId', async function (req, res, next) {
    const { userId, name, phone, isDefault, tag, province, city, district, detail } = req.body;
    console.log('从前端接收:', userId, name, phone, isDefault, tag, province, city, district, detail);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        console.log('数据库查询结果:', user);

        // 验证userid是否在数据库中

        // 判断完成之后创建地址
        // 第1步：等待数据库操作完成
        await Address.create({
            userId: userId,
            name: name,
            phone: phone,
            province: province,
            city: city,
            district: district,
            detail: detail || province + city + district + detail,
            isDefault: isDefault,
            tag: tag
        })
        // 地址添加成功后，返回地址信息
        // 第2步：数据库完成后才执行这里
        return res.status(201).json({
            message: '地址添加成功',
        })
    } catch (error) {
        return res.status(500).json({ message: '服务器错误' });
    }

})
// 获取用户地址列表
router.get('/getadrs/:userId', async function (req, res, next) {
    const { userId } = req.params;
    console.log('从前端接收:', userId);
    try {
        // 第1步：等待数据库操作完成
        const addresses = await Address.find({ userId: userId });
        console.log('数据库查询结果:', addresses);
        if (addresses.length === 0) {
            console.log('用户暂无地址');
            return res.status(404).json({ message: '用户暂无地址' });
        }
        // 第2步：数据库完成后才执行这里
        return res.status(200).json({
            message: '地址获取成功',
            data: addresses,
            code: 200
        })
    } catch (error) {
        return res.status(500).json({ message: '服务器错误' });
    }

})
// 删除地址
router.delete('/deladrs/:_id', async function (req, res, next) {
    const { _id } = req.params;
    const { userId } = req.query;
    try {
        // 第1步：等待数据库操作完成,前端传回 _id 来删除地址和用户id判断是否匹配 
        // 如果匹配，删除地址
        const result = await Address.deleteOne({ _id: _id, userId: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '地址不存在' });
        }
        // 第2步：数据库完成后才执行这里
        return res.status(200).json({
            message: '地址删除成功',
        })
    } catch (error) {
        return res.status(500).json({ message: '服务器错误' });
    }
})

module.exports = router;