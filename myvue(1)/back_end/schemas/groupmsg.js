let express = require('express');

let mongoose = require('mongoose');
const Schema = mongoose.Schema;



module.exports = new mongoose.Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true }, // 🔥 改为groupId
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },   // 🔥 改为sender
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});