const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用户数据模型
const userSchema = new mongoose.Schema({
  uid: { type: Number, unique: true, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 存储加密后的密码
});

// 在保存用户时加密密码
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);  // 生成盐值
    this.password = await bcrypt.hash(this.password, salt);  // 加密密码
  }
  next();
});

// 验证密码的方法
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);  // 比较密码
};

const User = mongoose.model('User', userSchema);

module.exports = User;
