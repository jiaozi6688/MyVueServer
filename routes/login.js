const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cart = require('../models/cart');
// 引入用户状态模型
const UserStatus = require('../models/userstatus.js');
// 引入商品模型
const ShangJiaGoods = require('../models/shangjiangoods');
// 引入jwt中间件
const { SetToken, VerifyToken } = require('../midfile/jwtMIddleWare');
// 生成token到期时间
const tokenExpireTime = new Date(Date.now() + 1000 * 60 * 60 * 24);
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
    // 如果有username  则  用username查询
    if (username) {
      // 把username赋值给matchCondition.username
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
    // 用户存在
    if (users.length > 0) {
      const user = users[0];
      // 验证密码是否正确
      const trimmedPassword = password.trim();
      if (user.password === trimmedPassword) {
        // token 存储在客户端的 localStorage 中
        const token = await SetToken({
          phone: user.phone,
          userId: user._id.toString(),
          username: user.username
        });
        console.log('生成的token:', token);
        if (token) {
          // 正确的语法 - 分别设置两个 cookie
          res.cookie('name', user.username, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/'
          });
          // token设置喂httpOnly  不能被js获取
          res.cookie('token', token, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/'
          });
          // 保存用户状态
          await UserStatus.create({
            userId: user._id,
            username: user.username,
            userPhone: user.phone,
            token: token,
            // token到期时间  1天
            tokenExpireTime: tokenExpireTime,
          });

          return res.status(200).json({
            message: '登录成功',
            code: 200,
            token: token,
            tokenExpireTime: tokenExpireTime,
            userInfo: {
              username: user.username,
              phone: user.phone,
              userId: user._id,
              role: user.role,
            },
          })
        }
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
router.post('/register', async function (req, res, next) {
  // console.log(req.body);
  // return;
  // 从请求中获取用户名和密码
  const { username, password, phone, role } = req.body;
  console.log('注册请求:', username, password, Number(phone), role);

  try {
    // 查找用户，判断用户是否存在
    const user = await User.findOne({ phone: Number(phone) });
    console.log('查询用户:', user);

    if (user) {
      // 用户已存在，注册失败
      return res.status(409).json({ message: '用户已存在,请重新输入手机号' });
    }

    // 用户不存在，创建新用户/购物车/商家数据库
    const newUser = new User({
      username: username.trim(),
      password: password.trim(),
      // 用户角色，默认值为user
      role: role,
      // 用户手机号 - 确保类型与数据库一致
      phone: Number(phone),
    });

    // 保存用户到数据库
    const savedUser = await newUser.save();
    console.log('注册保存用户:', savedUser);
    const userId = savedUser._id;

    // 先判断用户是否存在
    if (userId) {
      // 用户注册成功后，自动创建购物车
      const newCart = new Cart({
        //id是用户id，保持ObjectId类型
        userId: userId,
        cart: []
      });

      // 保存购物车到数据库
      try {
        const savedCart = await newCart.save();
        console.log('自动创建购物车成功:', savedCart);
      } catch (cartErr) {
        console.error('创建购物车错误:', cartErr);
        // 购物车创建失败不影响用户注册，仍返回注册成功
      }

      // 如果用户角色是admin，同时也自动创建商家数据库
      if (role === 'admin') {
        const newShangJiaGoods = new ShangJiaGoods({
          userId: userId.toString(),
          cart: []
        });

        // 保存商家数据库到数据库
        try {
          const savedShangJiaGoods = await newShangJiaGoods.save();
          console.log('自动创建商家数据库成功:', savedShangJiaGoods);
        } catch (shangJiaErr) {
          console.error('创建商家数据库错误:', shangJiaErr);
          // 商家数据库创建失败不影响用户注册，仍返回注册成功
        }
      }

      // 注册成功
      return res.status(200).json({
        message: '注册成功',
        code: 200
      });
    }
  } catch (err) {
    console.error('注册错误:', err);
    return res.status(500).json({ message: '服务器错误' });
  }
});
// 退出登录
router.post('/logout', async (req, res) => {
  try {
    console.log('退出登录请求:', req.body);
    // 清除cookie中的用户名
    res.clearCookie('name');
    // 清除token
    res.clearCookie('token');
    // 更新用户状态为offline
    const userId = req.body.userId;
    console.log('退出登录，userId:', userId);

    // 删除整个用户状态文档
    const result = await UserStatus.deleteOne(
      { userId: userId }
    );
    console.log('删除用户状态结果:', result);

    if (result.deletedCount > 0) {
      // 删除成功
      console.log('用户状态删除成功');
      return res.status(200).json({
        message: '退出登录成功',
        code: 200
      });
    } else {
      // 没有找到匹配的文档
      console.log('未找到匹配的用户状态文档');
      return res.status(404).json({
        message: '用户状态不存在',
        code: 404
      });
    }
  } catch (error) {
    console.error('退出登录错误:', error);
    return res.status(500).json({
      message: '服务器错误',
      code: 500
    });
  }

})

// 导出路由
module.exports = router;