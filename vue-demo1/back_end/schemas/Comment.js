let express = require("express");

let mongoose = require("mongoose"); //引入 mongoose 库，用于创建 MongoDB 的数据结构
module.exports = new mongoose.Schema({
  //评论添加的时间
  Time: {
    type: Date,
    default: Date.now,
  },

  //评论内容
  content: {
    type: String,
  },

  //评论者（发送者）的名字或ID
  writer: {
    type: String,
  },

  //from 表示评论的发送者，to 表示评论的接收者（如楼中楼的回复结构中，from 回复 to）
  from: {
    type: String,
  },
  to: {
    type: String,
  },

  //该评论所属的“朋友圈”（或帖子）对象的 ID
  pyq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pyq",
  },

  //存放该评论下的回复（如楼中楼）
  reply: {
    type: Array,
    default: [],
  },

  //当前评论是否有效或显示
  isn: {
    type: Boolean,
    default: true,
  },

  //目标用户是否可见/评论是否送达
  toisn: {
    type: Boolean,
    default: true,
  },
});
