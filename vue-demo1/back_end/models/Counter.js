const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: String, // 固定为 'userId'
  sequence_value: Number
});

module.exports = mongoose.model('Counter', counterSchema);
