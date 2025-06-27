// /backend/routers/auth.js
const express = require('express');
const User = require('../models/User');  // 引入用户模型
const router = express.Router();

// 处理用户注册
router.post('/register', async (req, res) => {
  const { username, password,confirmPassword } = req.body;

  try {
    // 确保用户名和密码不为空
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 检查用户名是否已存在
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    // 检查密码是否一致
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 创建新用户并保存
    const newUser = new User({ username, password });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error: ', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 处理用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);  // 使用 matchPassword 来验证
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 登录成功，设置用户会话
    req.session.user = { id: user._id, username: user.username };
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error: ', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

