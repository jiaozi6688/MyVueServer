const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    // 去除空格
    username: {
        type: String,
        trim: true,
        // 用户名必填
        required: true,
        // 用户名唯一
        // unique: true,
        // 用户名最小长度为6
        minlength: 3,
        // 用户名最大长度为10
        maxlength: 10,
        // 简化验证，避免配置错误
    },
    password: {
        type: String,
        trim: true,
        // 密码必填
        required: true,
        // 密码最小长度为6
        minlength: 6,
        // 密码最大长度为255，用于容纳bcrypt加密后的密码
        maxlength: 255,
        // 简化验证，避免配置错误
    },
    // 用户角色，默认值为user
    role: {
        type: String,
    },
    // 手机号
    phone: {
        type: Number,
        // 手机号必填
        required: true,
        // 手机号唯一
        unique: true,
        // 手机号长度验证（对于Number类型，使用min/max表示数值范围）
        min: 10000000000, // 11位手机号最小值
        max: 99999999999  // 11位手机号最大值
    },

});

// 导出模型，指定使用user集合
module.exports = mongoose.model('User', userSchema, 'user');