const express = require('express');  // 引入 Express 模块
const bcrypt = require('bcryptjs');  // 引入 bcryptjs 用于密码加密
const jwt = require('jsonwebtoken');  // 引入 jsonwebtoken 用于生成 JWT
const User = require('../models/User');  // 引入用户模型
const router = express.Router();  // 创建路由实例

// 用户注册接口
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;  // 获取请求体中的数据

  try {
    // 检查用户是否已存在
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);  // 创建盐值
    const hashedPassword = await bcrypt.hash(password, salt);  // 加密密码

    // 创建新的用户实例
    const newUser = new User({
      email,
      password: hashedPassword,  // 使用加密后的密码
      name,
    });

    // 保存用户到数据库
    await newUser.save();

    // 返回注册成功的响应
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 用户登录接口
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 比对密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 生成 JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 返回 JWT token
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 导出路由
module.exports = router;
