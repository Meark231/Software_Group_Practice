let express = require('express');
let app = express();
let path = require('path');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
let cors = require('cors');

app.use(cors({
    origin: ['http://localhost:8080'
        , 'http://10.138.194.217:8080' // 替换为你的实际IPv4地址和端口
    ], // 允许前端地址访问
    credentials: true // 如果需要携带cookie
}))

mongoose.connect('mongodb://localhost:27017/mycesshi', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch((err) => {
        console.error('数据库连接失败:', err);
    });

// 解析表单数据
app.use(bodyParser.json({ limit: '50mb' }));//限制文件大小
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 配置会话
app.use(session({
    secret: 'secret', // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 设置 session 的有效时间，单位毫秒
    }
}));

// 加载登录验证路由
app.use('/api/auth', require('../back_end/routes/auth.js'));

// 根路径请求
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../front/ceshi.html')); // sendFile yes 
})


// 启动服务器
app.listen(3000,() => {
    console.log("Server is running on port 3000");
});

