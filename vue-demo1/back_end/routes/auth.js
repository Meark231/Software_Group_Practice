// /backend/routers/auth.js
const express = require('express');
const User = require('../models/User');  // 引入用户模型
const router = express.Router();
const Counter = require('../models/Counter');  // 自增 UID 模型

// 获取下一个 uid（从 10000 开始）
async function getNextUid() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'userId' },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
}

// 处理用户注册
router.post('/register', async (req, res) => {
  const { username, password,confirmPassword } = req.body;

  try {
    // 确保用户名和密码不为空
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ message: '所有字段不能为空' });
    }

    // 检查用户名是否已存在
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    // 检查密码是否一致
    if (password !== confirmPassword) {
      return res.status(400).json({ message: '两次密码不一致' });
    }

    // 创建新用户并保存
    const uid = await getNextUid(); // 获取唯一 UID

    const newUser = new User({
      uid,
      username,
      password  // 会被 User.js 中 pre('save') 自动加密
    });

    await newUser.save();
    
    res.status(201).json({
      code: 0,
      message: '注册成功',
      data: {
        uid,
        username
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 处理用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '账号或密码错误' });
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);  // 使用 matchPassword 来验证
    if (!isMatch) {
      return res.status(400).json({ message: '账号或密码错误' });
    }

    // 登录成功，设置用户会话
    req.session.user = { id: user._id, username: user.username };
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        uid: user.uid,
        username: user.username
      }
    });
  } catch (error) {
    console.error('登录错误: ', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;

