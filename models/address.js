const mongoose = require('mongoose');
const addressSchema = mongoose.Schema({
    // 地址id   
    userId: {
        // 用户id
        type: String,
        required: true
    },
    // 收货人姓名
    name: {
        type: String,
        required: true
    },
    // 手机号
    phone: {
        type: String,
        required: true
    },
    // 省份
    province: {
        type: String,
        required: true
    },
    // 城市
    city: {
        type: String,
        required: true
    },
    // 区县
    district: {
        type: String,
        required: true
    },
    // 详细地址
    detail: {
        type: String,
        required: false
    },
    // 标签 例如：家、公司、学校等
    tag: {
        type: String,
    },
    // 是否默认地址
    isDefault: {
        type: Boolean,
        default: false
    }
})
module.exports = mongoose.model('Address', addressSchema, 'addresslist');
