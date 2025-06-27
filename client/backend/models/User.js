const mongoose = require('mongoose');  // 引入 mongoose

// 定义用户模型的 schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },  // 用户邮箱
  password: { type: String, required: true },  // 用户密码
  name: { type: String, required: true },  // 用户名称
});

// 创建并导出 User 模型
const User = mongoose.model('User', UserSchema);
module.exports = User;
