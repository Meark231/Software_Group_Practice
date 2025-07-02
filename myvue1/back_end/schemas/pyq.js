let express = require('express');

let mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new mongoose.Schema({
  // 🔥 修正：去掉_id定义（MongoDB会自动生成）
  author: {                   
    username: { type: String, required: true },         
    avatar: { type: String, default: '' }            
  },
  content: {
    text: { type: String, default: '' },             
    images: [String]          // 图片URL数组
  },
  timestamp: { type: Date, default: Date.now },    // 🔥 添加默认值
  likes: [                    
    {
      username: String,       
      timestamp: { type: Date, default: Date.now }  // 🔥 添加默认值
    }
  ],
  comments: [                 
    {
      // 🔥 修正：评论的_id会自动生成
      username: { type: String, required: true },       
      content: { type: String, required: true },        
      timestamp: { type: Date, default: Date.now }      // 🔥 添加时间戳
    }
  ]
});