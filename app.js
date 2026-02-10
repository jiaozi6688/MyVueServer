var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
// 引入用户路由
const usersRouter = require('./routes/login');
// 引入购物车路由
const cartRouter = require('./routes/cart');
// 映入商家商品路由
const adminGoodsRouter = require('./routes/admingoods');
// 引入用户地址地址路由
const addressRouter = require('./routes/address');
// 引入商品路由
const goodlistRouter = require('./routes/goodlist');
// 引入WebSocket服务
const wss = require('./routes/ws');

var app = express();

// 增强跨域配置
app.use(cors({
  origin: ['http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// mongoose
var mongoose = require('mongoose');
// 连接数据库
mongoose.connect('mongodb://localhost:27017/usermessage').then(() => {
  console.log('数据库连接成功');
}).catch((err) => {
  console.log('数据库连接失败：' + err);
});
// 数据库连接成功
mongoose.connection.on('open', function () {
  console.log('数据库连接成功');
});
// 数据库连接失败
mongoose.connection.on('error', function (err) {
  console.log('数据库连接失败：' + err);
});
// 数据库连接断开
mongoose.connection.on('disconnected', function () {
  console.log('数据库连接断开');
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', usersRouter);
app.use('/cart', cartRouter);
// 商家商品路由
app.use('/admingoods', adminGoodsRouter);
// 用户地址路由
app.use('/userads', addressRouter);
// 商品路由
app.use('/getgoodslist', goodlistRouter);

module.exports = app;