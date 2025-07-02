let express = require('express');

let mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new mongoose.Schema({
     name: { type: String, required: true },           // 群聊名称
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 创建者
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }], // 群成员
    createdAt: { type: Date, default: Date.now },       // 创建时间


});