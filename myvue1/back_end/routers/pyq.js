const express = require('express');
const router = express.Router();
const Pyq = require('../models/Pyq');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// 🔥 配置图片上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/'); // 保存到public/img目录
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：原文件名_时间戳.扩展名
    const uniqueName = `moment_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 🔥 1. 发布动态
router.post('/api/moments/create', upload.array('images', 9), async (req, res) => {
  console.log('🔥 收到发布动态请求');
  console.log('🔥 请求体:', req.body);
  console.log('🔥 上传文件:', req.files);
  
  try {
    const { username, text } = req.body;
    
    if (!username) {
      return res.json({ code: 1, msg: '缺少用户名' });
    }
    
    if (!text && (!req.files || req.files.length === 0)) {
      return res.json({ code: 1, msg: '动态内容不能为空' });
    }
    

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ code: 2, msg: '用户不存在' });
    }
    // 🔥 处理上传的图片
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {      // 3000
        const imageUrl = `https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/public/img/${file.filename}`;
        imageUrls.push(imageUrl);
      });
    }
    
    // 🔥 创建动态数据
    const momentData = {
      author: {
        username: username,
        avatar: user.avatar || '' // 这里可以从用户信息中获取
      },
      content: {
        text: text || '',
        images: imageUrls
      },
      likes: [],
      comments: []
    };
    
    console.log('🔥 准备保存的动态数据:', momentData);
    
    // 🔥 保存到数据库
    const newMoment = await Pyq.create(momentData);
    console.log('🔥 动态创建成功:', newMoment._id);
    
    res.json({ 
      code: 0, 
      msg: '发布成功', 
      data: newMoment 
    });
    
  } catch (error) {
    console.error('🔥 发布动态失败:', error);
    res.json({ code: 2, msg: '发布失败: ' + error.message });
  }
});

// 🔥 2. 获取动态列表
router.get('/api/moments/list', async (req, res) => {
  console.log('🔥 收到获取动态列表请求');
  
  try {
    // 🔥 按时间倒序获取所有动态
    const moments = await Pyq.find({})
      .sort({ timestamp: -1 }) // 最新的在前面
      .limit(50); // 限制返回50条
    
    console.log('🔥 获取到动态数量:', moments.length);
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: moments
    });
    
  } catch (error) {
    console.error('🔥 获取动态列表失败:', error);
    res.json({ code: 2, msg: '获取失败: ' + error.message });
  }
});

// 🔥 3. 点赞/取消点赞
router.post('/api/moments/like', async (req, res) => {
  console.log('🔥 收到点赞请求');
  console.log('🔥 请求体:', req.body);
  
  try {
    const { momentId, username } = req.body;
    
    if (!momentId || !username) {
      return res.json({ code: 1, msg: '缺少必要参数' });
    }
    
    // 🔥 查找动态
    const moment = await Pyq.findById(momentId);
    if (!moment) {
      return res.json({ code: 2, msg: '动态不存在' });
    }
    
    // 🔥 检查是否已经点赞
    const existingLikeIndex = moment.likes.findIndex(like => like.username === username);
    
    if (existingLikeIndex !== -1) {
      // 🔥 已经点赞，取消点赞
      moment.likes.splice(existingLikeIndex, 1);
      console.log('🔥 取消点赞');
    } else {
      // 🔥 未点赞，添加点赞
      moment.likes.push({
        username: username,
        timestamp: new Date()
      });
      console.log('🔥 添加点赞');
    }
    
    // 🔥 保存更新
    await moment.save();
    
    res.json({
      code: 0,
      msg: existingLikeIndex !== -1 ? '取消点赞成功' : '点赞成功',
      data: {
        momentId: momentId,
        likesCount: moment.likes.length,
        isLiked: existingLikeIndex === -1, // 当前状态
        likes: moment.likes
      }
    });
    
  } catch (error) {
    console.error('🔥 点赞操作失败:', error);
    res.json({ code: 2, msg: '操作失败: ' + error.message });
  }
});

// 🔥 4. 发布评论
router.post('/api/moments/comment', async (req, res) => {
  console.log('🔥 收到发布评论请求');
  console.log('🔥 请求体:', req.body);
  
  try {
    const { momentId, username, content } = req.body;
    
    if (!momentId || !username || !content) {
      return res.json({ code: 1, msg: '缺少必要参数' });
    }
    
    if (content.trim().length === 0) {
      return res.json({ code: 1, msg: '评论内容不能为空' });
    }
    
    // 🔥 查找动态
    const moment = await Pyq.findById(momentId);
    if (!moment) {
      return res.json({ code: 2, msg: '动态不存在' });
    }
    
    // 🔥 添加评论
    const newComment = {
      username: username,
      content: content.trim(),
      timestamp: new Date()
    };
    
    moment.comments.push(newComment);
    
    // 🔥 保存更新
    await moment.save();
    
    console.log('🔥 评论添加成功');
    
    res.json({
      code: 0,
      msg: '评论成功',
      data: {
        momentId: momentId,
        commentsCount: moment.comments.length,
        newComment: newComment,
        comments: moment.comments
      }
    });
    
  } catch (error) {
    console.error('🔥 发布评论失败:', error);
    res.json({ code: 2, msg: '评论失败: ' + error.message });
  }
});

module.exports = router;