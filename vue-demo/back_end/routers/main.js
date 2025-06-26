let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Password = require('../models/Password');
const crypto = require('crypto');

let responseData;

router.use((res,req,next)=>{
    responseData = {
        code:0,
        msg:''
    };
    next();
});

router.post('/api/register',(req,res,next)=>{
    let username = req.body.username;
    let password = req.body.password;
    //用户名不为空
    if(username === ''){
        responseData.code = 1;
        responseData.msg = '用户名不能为空';
        res.json(responseData);
        return;
    }
    //密码不为空
    if( password === ''){
        responseData.code = 2;
        responseData.msg = '密码不能为空';
        res.json(responseData);
        return;
    }
    //用户名是否已存在
    User.findOne({
        username:username
    }).then((userInfo)=>{
        if(userInfo){
            responseData.code = 4;
            responseData.msg = '用户名已存在';
            res.json(responseData);
            return;
        }
        password = crypto.createHmac('sha256', password)
            .update('juju')
            .digest('hex');
        let psd = new Password({
            username:username,
            password:password
        });
        let user =new User({
           username
        });
        psd.save().then(()=>{
            return user.save();
        });
    }).then((newUserInfo)=>{
        console.log(newUserInfo);
        responseData.msg = '注册成功';
        res.json(responseData);
    });
});

module.exports = router;