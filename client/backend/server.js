const express = require('express'); // 引入 Express 模块，用于创建 HTTP 服务器和处理路由
const mongoose = require('mongoose'); // 引入 mongoose 用于连接和操作 MongoDB
const cors = require('cors'); // 引入 CORS 用于处理跨域请求（前端和后端分离时必须启用）
const dotenv = require('dotenv'); // 引入 dotenv，用于加载环境变量（比如数据库连接字符串、JWT 密钥）

dotenv.config();  //加载 .env 文件中的变量，并使它们成为 process.env 对象的一部分。这样就可以在代码中使用 process.env.VARIABLE_NAME 来访问这些值。

// 创建 Express 应用
const app = express(); //app是我的Express应用实例，通过它可以设置路由、中间件、处理请求等。

// Middleware（中间件）设置
app.use(cors());  // 启用 CORS 中间件，允许跨域请求（跨域访问是前后端分离开发时常见的需求）
app.use(express.json());  // 使用 express.json() 中间件，自动解析传入请求中的 JSON 数据

// 连接到 MongoDB 数据库
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))  // 如果连接成功，输出成功消息
  .catch((err) => console.log(err));  // 如果连接失败，输出错误信息

// 路由处理
app.get('/', (req, res) => {  // 定义一个简单的 GET 路由，访问根路径时返回 "Hello, World!"
  res.send('Hello, World!');
});

// 设置用户注册和登录接口（后续会在 /api/auth 路由中定义）
const authRoutes = require('./routes/auth');  // 引入定义好的 auth 路由

app.use('/api/auth', authRoutes);  // 使用 /api/auth 路径前缀，处理所有与用户认证相关的请求

// 启动服务器，监听指定端口
const PORT = process.env.PORT || 5000;  // 使用 .env 文件中的 PORT 环境变量（如果有），否则默认使用 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);  // 启动服务器，输出服务器启动的端口
});

