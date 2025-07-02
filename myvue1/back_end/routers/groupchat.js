let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Group = require('../models/Group');
let Groupmsg = require('../models/Groupmsg');

// 创建群聊
router.post('/api/group/create', async (req, res) => {
  const { groupName, creatorUsername, memberUsernames } = req.body;
  
  if (!groupName || !creatorUsername || !Array.isArray(memberUsernames)) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }
  
  try {
    // 查找创建者
    const creator = await User.findOne({ username: creatorUsername });
    if (!creator) {
      return res.json({ code: 1, msg: '创建者不存在' });
    }
    
    // 查找所有成员
    const allUsernames = [creatorUsername, ...memberUsernames];
    const members = await User.find({ username: { $in: allUsernames } });
    const memberIds = members.map(user => user._id);
    
    // 创建群聊
    const newGroup = await Group.create({
      name: groupName,
      creator: creator._id,
      members: memberIds
    });
    
    res.json({ code: 0, msg: '群聊创建成功', group: newGroup });
  } catch (err) {
    console.error('创建群聊失败:', err);
    res.json({ code: 2, msg: '创建群聊失败' });
  }
});

// 获取用户的群聊列表
router.get('/api/group/list', async (req, res) => {
  const username = req.query.username;
  
  if (!username) {
    return res.json({ code: 1, msg: '缺少用户信息' });
  }
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ code: 1, msg: '用户不存在' });
    }
    
    // 查找用户参与的群聊
    const groups = await Group.find({ 
      members: user._id 
    }).populate('creator', 'username').populate('members', 'username');
    
    res.json({ code: 0, groups });
  } catch (err) {
    console.error('获取群聊列表失败:', err);
    res.json({ code: 1, msg: '获取群聊列表失败' });
  }
});

// 发送群消息
router.post('/api/group/message/send', async (req, res) => {
  const { senderUsername, groupId, content } = req.body;
  
  if (!senderUsername || !groupId || !content) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }
  
  try {
    const sender = await User.findOne({ username: senderUsername });
    if (!sender) {
      return res.json({ code: 1, msg: '发送者不存在' });
    }
    
    // 验证用户是否在群聊中
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(sender._id)) {
      return res.json({ code: 1, msg: '您不在此群聊中' });
    }
    
    // 创建群消息
    const newMessage = await Groupmsg.create({
      groupId: groupId,  // 🔥 使用groupId
      sender: sender._id, // 🔥 使用sender
      content: content
    });
    
    res.json({ code: 0, msg: '发送成功' });
  } catch (err) {
    console.error('发送群消息失败:', err);
    res.json({ code: 2, msg: '发送失败' });
  }
});

// 获取群聊历史消息
router.get('/api/group/message/history', async (req, res) => {
  const { groupId, username } = req.query;
  
  if (!groupId || !username) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ code: 1, msg: '用户不存在' });
    }
    
    // 验证权限
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(user._id)) {
      return res.json({ code: 1, msg: '无权限查看此群聊' });
    }
    
    // 查询群消息
    const messages = await Groupmsg.find({ groupId })
      .populate('sender', 'username')
      .sort({ timestamp: 1 });
    
    // 处理消息数据
    const processedMessages = messages.map(msg => ({
      _id: msg._id,
      groupId: msg.groupId,
      sender: msg.sender._id,
      senderUsername: msg.sender.username,
      content: msg.content,
      timestamp: msg.timestamp,
      fromSelf: msg.sender._id.toString() === user._id.toString()
    }));
    
    res.json({ code: 0, messages: processedMessages });
  } catch (err) {
    console.error('获取群聊历史消息失败:', err);
    res.json({ code: 2, msg: '获取群聊历史消息失败' });
  }
});

module.exports = router;