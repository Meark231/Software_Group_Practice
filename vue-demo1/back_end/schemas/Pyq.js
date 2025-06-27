let express = require("express");

let mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  //帖子添加时间，默认值为当前时间。用来记录用户发布朋友圈的时间。
  addTime: {
    type: Date,
    default: Date.now,
  },

  //浏览次数，初始为 0。
  views: {
    type: Number,
    default: 0,
  },

  //帖子正文内容
  content: String,

  //发帖人，存的是一个 User 模型的 _id。
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  //评论列表，是一个数组，每一项是对 Comment 模型的引用。
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],

  //图片数组字段，存储与帖子相关的图片链接。
  pimg: {
    type: Array,
    default: [],
  },
});
