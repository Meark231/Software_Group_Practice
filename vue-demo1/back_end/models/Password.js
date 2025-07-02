const bcrypt = require('bcryptjs');

// 用于加密密码
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);  // 返回加密后的密码
};

// 用于验证密码
const matchPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);  // 验证密码是否匹配
};

module.exports = {
  hashPassword,
  matchPassword,
};

