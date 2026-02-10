const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cart = require('../models/cart');
const ShangJiaGoods = require('../models/shangjiangoods');

// 登录
router.post('/login', async function (req, res, next) {
  const { username, password, phone } = req.body;
  console.log('从前端接收:', username, password, phone);

  // 验证密码不能为空
  if (!password) {
    return res.status(400).json({ message: '密码不能为空' });
  }

  // 验证用户名和手机号至少提供一个
  if (!username && !phone) {
    return res.status(400).json({ message: '用户名或手机号不能为空' });
  }

  try {
    // 构建查询条件
    let matchCondition = {};

    if (phone) {
      matchCondition.phone = Number(phone);
    }
    if (username) {
      matchCondition.username = username.trim();
    }

    // 如果同时提供了用户名和手机号，使用$or条件
    if (username && phone) {
      matchCondition = {
        $or: [
          { phone: Number(phone) },
          { username: username.trim() }
        ]
      };
    }

    console.log('查询条件:', matchCondition);

    // 使用聚合查询，关联用户和购物车
    const users = await User.aggregate([
      {
        $match: matchCondition
      },
      {
        $lookup: {
          from: 'cart', // 去哪个表查
          localField: '_id', // 当前表里的那个字段  用来在from ：’cart‘表中  找到 购物车中用户当前登录的id
          foreignField: 'userId', // 目标表中的那个字段  用来和  当前表里的那个字段  进行匹配
          as: 'cart' // 关联结果的别名，是一个数组，包含了用户的购物车信息
        }
      }
    ]);
    console.log('关联查询结果user.cart:', users.cart);
    console.log('查询到的用户:', users);

    // 用户存在
    if (users.length > 0) {
      const user = users[0];
      // 验证密码是否正确
      const trimmedPassword = password.trim();

      if (user.password === trimmedPassword) {
        // token 存储在客户端的 localStorage 中
        const token = user.username + user.password;
        // console.log('登录成功,返回购物车信息users.cart:', user.cart);
        return res.status(200).json({
          message: '登录成功',
          code: 200,
          token: token,
          userInfo: {
            username: user.username,
            phone: user.phone,
            userId: user._id,
            role: user.role,
          },
        })
      } else {
        return res.status(401).json({
          message: '密码错误,请重新输入'
        })
      }
    }
    // 用户不存在
    else {
      return res.status(404).json({
        message: '用户不存在,请先注册'
      })
    }
  } catch (err) {
    // 数据库查询错误
    console.error('登录查询错误:', err);
    return res.status(500).json({ message: '服务器错误' });
  }
});

// 注册
router.post('/register', function (req, res, next) {
  // console.log(req.body);
  // return;
  // 从请求中获取用户名和密码
  const { username, password, phone, role } = req.body;
  console.log('注册请求:', username, password, Number(phone), role);

  // 查找用户，判断用户是否存在
  //  User.findOne({ phone: phone }, (err, user) 是一个异步操作，用于查询数据库中是否存在手机号为 phone 的用户当查询完成后，
  // 会调用回调函数 (err, user) => {...} ，如果查询成功，会将查询结果作为参数传递给回调函数放在 user 变量中
  User.findOne({ phone: Number(phone) }, (err, user) => {
    console.log('查询用户:', user);
    if (err) {
      console.error('注册查询错误:', err);
      return res.status(500).json({ message: '服务器错误' });
    }

    if (user) {
      // 用户已存在，注册失败
      return res.status(409).json({ message: '用户已存在,请重新输入手机号' });
    }

    // 用户不存在，创建新用户/购物车/商家数据库
    else if (!user) {
      const newUser = new User({
        username: username.trim(),
        password: password.trim(),
        // 用户角色，默认值为user
        role: role,
        // 用户手机号 - 确保类型与数据库一致
        phone: Number(phone),
      });

      // 保存用户到数据库,save是数据库方法,用于将用户对象保存到数据库，savedUser是保存后的用户对象
      newUser.save((err, savedUser) => {
        console.log('注册保存用户:', savedUser);
        if (err) {
          console.error('注册保存错误:', err);
          return res.status(500).json({ message: '服务器错误' });
        }
        const userId = savedUser._id;
        // 先判断用户是否存在
        if (userId) {
          // 用户注册成功后，自动创建购物车
          const newCart = new Cart({
            //id是用户id，保持ObjectId类型
            userId: userId,
            cart: []
          });
          newCart.save((cartErr, savedCart) => {
            if (cartErr) {
              return console.error('创建购物车错误:', cartErr);
              // 购物车创建失败不影响用户注册，仍返回注册成功
            }
            console.log('自动创建购物车成功:', savedCart);

            // 注册成功
            return res.status(200).json({
              message: '注册成功',
              code: 200
            });
          });
          // 如果用户角色是admin，同时也自动创建商家数据库
          if (role === 'admin') {
            const newShangJiaGoods = new ShangJiaGoods({
              userId: userId.toString(),
              cart: []
            });
            newShangJiaGoods.save((shangJiaErr, savedShangJiaGoods) => {
              if (shangJiaErr) {
                return console.error('创建商家数据库错误:', shangJiaErr);
                // 商家数据库创建失败不影响用户注册，仍返回注册成功
              }
              console.log('自动创建商家数据库成功:', savedShangJiaGoods);
            });
          }
        }

      });
    }
  });
});
// 导出路由
module.exports = router;