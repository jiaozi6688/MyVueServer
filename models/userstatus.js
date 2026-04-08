const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: String,
    userPhone: String,
    status: { type: String, default: 'online', enum: ['online', 'offline'] },
    token: String,
    // 创建时间
    createTime: { type: Date, default: Date.now },
    // 更新时间
    updateTime: { type: Date, default: Date.now },
    // token到期时间
    tokenExpireTime: { type: Date, default: null, required: false },
    // 删除时间
    deleteTime: { type: Date, default: null, required: false }
});
module.exports = mongoose.model('UserStatus', userStatusSchema);