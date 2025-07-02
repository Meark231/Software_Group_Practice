let express = require('express');
let app = express();
let path = require('path');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
let cors = require('cors');

// 新增socket.io配置 
let http = require('http');
let server = http.createServer(app);
let { Server } = require('socket.io');
let io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://10.138.194.217:8080'],
    credentials: true
  }
});

let currentRoomId = 10000; // 初始群聊 ID 从 10000 开始

// 原有配置不变
app.use(cors({
  origin: ['http://localhost:8080', 'http://10.138.194.217:8080'],
  credentials: true
}));

mongoose.connect('mongodb://localhost:27017/mycesshi', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch((err) => {
    console.error('数据库连接失败:', err);
  });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}));

// 路由
app.use('/api/auth', require('../back_end/routes/auth.js'));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../front/ceshi.html'));
});


// Socket.io 配置逻辑 
io.on('connection', (socket) => {
  console.log('有用户连接:', socket.id);

  socket.on('login', (username) => {
    console.log(`${username} 登录了，Socket ID: ${socket.id}`);
  });

  // 加入房间
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);  // 加入指定房间
    console.log(`用户 ${socket.id} 加入了房间 ${roomId}`);
  });

  // 创建新群聊
  socket.on('createGroupChat', (username) => {
    const newRoomId = currentRoomId++;  // 生成新的群聊 ID
    socket.join(newRoomId);  // 用户加入新的群聊
    console.log(`${username} 创建了群聊，房间ID: ${newRoomId}`);
    io.to(newRoomId).emit('groupChatCreated', { roomId: newRoomId, username });
  });

  // 发送消息
  socket.on('sendMessage', (msg) => {
    console.log('收到消息:', msg);
    io.to(msg.roomId).emit('receiveMessage', msg);  // 只广播到该房间
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});


// 替换 app.listen()，改用 server.listen()
server.listen(3000, () => {
  console.log("服务器已启动： http://localhost:3000");
});



