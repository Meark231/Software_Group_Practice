let express = require('express');
let router = express.Router();
let User = require('../models/User');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img'));
  },
  filename: function (req, file, cb) {
    // 🔥 修改：从请求体获取用户名，而不是session
    const username = req.body.username || 'anonymous';
    const ext = path.extname(file.originalname);
    cb(null, username + '_' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

router.post('/api/user/signature', (req, res) => {

    let signature = req.body.signature;
    let username = req.body.username;
    User.findOne({
        username: username
    }).then((rs) => {
        if (!rs) {
            res.json({
                code:1,
                msg:"用户不存在！"
            });
            return 0;
        } else {
            User.updateOne({
                username: username
            }, {
                signature: signature
            }).then(() => {

              //req.session.userInfo.signature = signature;
                res.json({
                    code:0,
                    msg: '修改成功'
                });
                return 0;
            })
        }
    })
})

router.get('/api/user/profile', (req, res) => {
  // 1. 先查 session
  // const sessionUser = req.session.userInfo;
  // if (!sessionUser) {
  //   return res.json({ code: 1, msg: '未登录' });
  // }
  
  // 根据session中的用户名查询数据库最新信息
  // User.findOne({ username: sessionUser.username })
  //   .then(userInfo => {
  //     if (userInfo) {
  //       res.json({ code: 0, userInfo });
  //     } else {
  //       res.json({ code: 2, msg: '用户不存在' });
  //     }
  //   })
  //   .catch(err => {
  //     console.error('查询用户失败:', err);
  //     res.json({ code: 2, msg: '服务器错误' });
  //   });
  const username = req.query.username;
  
  if (!username) {
    return res.json({ code: 1, msg: '缺少用户名参数' });
  }
  
  // 直接根据用户名查询数据库
  User.findOne({ username: username })
    .then(userInfo => {
      if (userInfo) {
        res.json({ code: 0, userInfo });
      } else {
        res.json({ code: 2, msg: '用户不存在' });
      }
    })
    .catch(err => {
      console.error('查询用户失败:', err);
      res.json({ code: 2, msg: '服务器错误' });
    });
});

router.post('/api/user/avatar', upload.single('avatar'), async (req, res) => {
  // if (!req.session.userInfo) {
  //   return res.json({ code: 1, msg: '未登录' });
  // }
  // const username = req.session.userInfo.username;
  // const fileUrl = `https://ae88-2001-250-4001-208-addd-61f-1192-be83.ngrok-free.app/public/img/${req.file.filename}`;
  // try {
  //   await User.updateOne({ username }, { avater: fileUrl });
  //   // 更新 session
  //   req.session.userInfo.avater = fileUrl;
  //   res.json({ code: 0, msg: '头像上传成功', avatar: fileUrl });
  // } catch (err) {
  //   res.json({ code: 2, msg: '头像上传失败' });
  // }

  const username = req.body.username;
  
  if (!username) {
    return res.json({ code: 1, msg: '缺少用户名参数' });
  }
  
  if (!req.file) {
    return res.json({ code: 1, msg: '未选择文件' });
  }
  
  // 🔥 生成文件URL  // 3000  //有public
  const fileUrl = `https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/public/img/${req.file.filename}`;
  
  try {
    // 🔥 验证用户是否存在
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ code: 2, msg: '用户不存在' });
    }
    
    // 🔥 更新数据库
    await User.updateOne({ username }, { avatar: fileUrl });
    console.log('头像上传成功:', user.avatar);
    
    res.json({ code: 0, msg: '头像上传成功', avatar: fileUrl });
  } catch (err) {
    console.error('头像上传失败:', err);
    res.json({ code: 2, msg: '头像上传失败' });
  }
});
module.exports = router;




