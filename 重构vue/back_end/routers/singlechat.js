let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Message = require('../models/Messages');

// 获取用户列表
router.get('/api/user/list', async (req, res) => {
  try {
    // 🔥 注意：你的schema是avatar，但前端用的是avater
    const users = await User.find({}, { username: 1, avatar: 1 });
    res.json({ code: 0, users });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    res.json({ code: 1, msg: '获取用户列表失败' });
  }
});

// 发送消息
router.post('/api/message/send', async (req, res) => {
  const fromUsername = req.body.fromUsername;
  const toUserId = req.body.to;
  const content = req.body.content;
  
  if (!fromUsername || !toUserId || !content) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }
  
  try {
    // 根据用户名查找发送者ID
    const fromUser = await User.findOne({ username: fromUsername });
    if (!fromUser) {
      return res.json({ code: 1, msg: '发送者不存在' });
    }
    
    // 创建消息
    const newMessage = await Message.create({ 
      from: fromUser._id, 
      to: toUserId, 
      content, 
      timestamp: new Date() 
    });
    
    console.log('消息发送成功:', newMessage);
    res.json({ code: 0, msg: '发送成功' });
  } catch (err) {
    console.error('发送消息失败:', err);
    res.json({ code: 2, msg: '发送失败' });
  }
});

// 获取历史消息
router.get('/api/message/history', async (req, res) => {
  const myUsername = req.query.myUsername;
  const otherId = req.query.to;
  
  if (!myUsername || !otherId) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }
  
  try {
    // 根据用户名查找自己的ID
    const myUser = await User.findOne({ username: myUsername });
    if (!myUser) {
      return res.json({ code: 1, msg: '用户不存在' });
    }
    
    const myId = myUser._id;
    
    // 查询消息并填充用户信息
    const messages = await Message.find({
      $or: [
        { from: myId, to: otherId },
        { from: otherId, to: myId }
      ]
    })
    .populate('from', 'username')
    .populate('to', 'username')
    .sort({ timestamp: 1 });
    
    // 🔥 处理消息数据，标识是否为自己发送
    const processedMessages = messages.map(msg => ({
      _id: msg._id,
      from: msg.from._id,
      fromUsername: msg.from.username,
      to: msg.to._id,
      toUsername: msg.to.username,
      content: msg.content,
      timestamp: msg.timestamp,
      fromSelf: msg.from._id.toString() === myId.toString()
    }));
    
    res.json({ code: 0, messages: processedMessages });
  } catch (err) {
    console.error('获取历史消息失败:', err);
    res.json({ code: 2, msg: '获取历史消息失败' });
  }
});

module.exports = router;