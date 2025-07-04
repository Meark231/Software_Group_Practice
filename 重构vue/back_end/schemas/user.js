let express = require('express');
let mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    username:String,
    isAdmin:{
        type:Boolean,
        default:false
    },
    avatar:{
        type:String,
        default: null
    },
    signature:{
        type:String,
        default:'这人很懒，这是系统帮他写的'
    }
});