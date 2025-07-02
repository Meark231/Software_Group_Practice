let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Password = require('../models/Password');
const crypto = require('crypto');


router.post('/api/register', async (req, res) => {
   const username = req.body.username;
    const password = req.body.password;
    let responseData = { code: 0, msg: '' };

    if (!username) {
        responseData.code = 1;
        responseData.msg = '用户名不能为空';
        return res.json(responseData);
    }
    if (!password) {
        responseData.code = 2;
        responseData.msg = '密码不能为空';
        return res.json(responseData);
    }
    try {
        const userInfo = await User.findOne({ username });
        if (userInfo) {
            responseData.code = 4;
            responseData.msg = '用户名已存在';
            return res.json(responseData);
        }
        const cryptoPwd = require('crypto').createHmac('sha256', password).update('juju').digest('hex');
        const psd = new Password({ username, password: cryptoPwd });
        const user = new User({ username });
        await psd.save();
        await user.save();
        responseData.msg = '注册成功';
        return res.json(responseData);
    } catch (err) {
        responseData.code = 500;
        responseData.msg = '服务器错误';
        return res.json(responseData);
    }

})

router.post('/api/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let responseData = { code: 0, msg: '' };

    if (!username || !password) {
        responseData.code = 1;
        responseData.msg = '用户名或密码不能为空';
        return res.json(responseData);
    }
    try {
        const cryptoPwd = require('crypto').createHmac('sha256', password).update('juju').digest('hex');
        const rs = await Password.findOne({ username, password: cryptoPwd });
        if (!rs) {
            responseData.code = 2;
            responseData.msg = '用户名不存在或密码错误';
            return res.json(responseData);
        }
        const userInfo = await User.findOne({ username });
        if (!userInfo) {
            responseData.code = 3;
            responseData.msg = '用户信息不存在';
            return res.json(responseData);
        }
        responseData.msg = '登录成功';
        responseData.userInfo = {
            username: userInfo.username,
            _id: userInfo._id,
            avatar: userInfo.avatar,
            signature: userInfo.signature
        };
        req.session.userInfo = responseData.userInfo;//创建session
        return res.json(responseData);
    } catch (err) {
        responseData.code = 500;
        responseData.msg = '服务器错误';
        return res.json(responseData);
    }
});

module.exports = router;
