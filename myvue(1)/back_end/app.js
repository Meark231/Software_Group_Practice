let express = require('express');
let app = express();
let path = require('path');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
let cors = require('cors');

let http = require('http');
let socketIo = require('socket.io'); 

let server = http.createServer(app);
let io = socketIo(server, {
    cors: {
        origin: [
            'http://localhost:8080', 
            'https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app',
            'https://9fa6-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app',
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);
    
    // 用户加入
    socket.on('join', (username) => {
        socket.username = username;
        console.log(`${username} 加入聊天`);
    });
    
    // 🔥 加入群聊房间
    socket.on('join-group', (groupId) => {
        socket.join(groupId);
        console.log(`${socket.username} 加入群聊: ${groupId}`);
    });
    
    // 🔥 离开群聊房间
    socket.on('leave-group', (groupId) => {
        socket.leave(groupId);
        console.log(`${socket.username} 离开群聊: ${groupId}`);
    });
    
    // 🔥 群聊消息转发
    socket.on('send-group-message', (data) => {
        console.log('转发群消息:', data);
        // 发送给群聊中的所有其他用户
        socket.to(data.groupId).emit('receive-group-message', {
            groupId: data.groupId,
            senderUsername: socket.username,
            content: data.content,
            timestamp: new Date()
        });
    });
    
    // 🔥 私聊消息转发（保持原有功能）
    socket.on('send-message', (data) => {
        console.log('转发消息:', data);
        // 发送给所有其他用户
        socket.broadcast.emit('receive-message', {
            fromUsername: socket.username,
            toUsername: data.toUsername,
            content: data.content,
            timestamp: new Date()
        });
    });
    
    // 断开连接
    socket.on('disconnect', () => {
        console.log('用户断开:', socket.username);
    });
});

app.use(cors({
    origin: ['http://localhost:8080', 
        'http://10.138.194.217:8080', 
        'http://10.135.7.250:8080',
    'https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app',
    'https://9fa6-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000 * 60 * 60 * 24 * 7 ,
        secure: true,
        sameSite: 'none'
    }
}))

mongoose.connect('mongodb://localhost:27017/myvue', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch((err) => {
        console.error('数据库连接失败:', err);
    });

app.use('/', require('./routers/main.js'));
app.use('/', require('./routers/profile.js'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', require('./routers/singlechat.js'));
app.use('/', require('./routers/groupchat.js')); // 🔥 添加群聊路由
app.use('/', require('./routers/pyq.js'));

server.listen(3000, '0.0.0.0', () => {
    console.log('服务器已启动，端口：3000');
    console.log('Socket.IO已启用');
});