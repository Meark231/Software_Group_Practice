// 引入三个模型文件
let User = require("../models/User"); // 用户模型
let Comment = require("../models/Comment"); // 评论模型
let Pyq = require("../models/Pyq"); // 朋友圈（动态）模型
let express = require("express");
let router = express.Router();

// ==================== 发布评论接口 ====================
router.post("/", (req, res) => {
  // 从请求体中取出评论相关参数
  let content = req.body.content; // 评论内容
  let from = req.body.from; // 评论者用户名
  let to = req.body.to || ""; // 被@用户，默认空字符串
  let pyqId = req.body.pyq; // 评论对应的朋友圈ID
  let writer = req.body.writer; // 发朋友圈的人

  // 新建评论对象并存入数据库
  new Comment({
    content: content,
    from: from,
    to: to,
    pyq: pyqId,
    writer: writer,
  })
    .save()
    .then((rs) => {
      // 评论存好以后，更新对应朋友圈，把评论ID推进 comments 数组
      Pyq.findOne({ _id: pyqId }).then((result) => {
        let comments = result.comments; // 当前朋友圈评论ID数组
        comments.push(rs._id); // 新评论ID push 到数组

        // 使用 updateOne 来更新对应朋友圈
        Pyq.updateOne({ _id: pyqId }, { comments: comments }).then(() => {
          res.json({
            code: 0,
            msg: "评论成功",
          });
        });
      });
    });
});

// ==================== 获取评论接口 ====================
router.get("/getcom", (req, res) => {
  // 排序函数：按评论时间升序
  function sorttime(a, b) {
    return new Date(a.addTime) - new Date(b.addTime);
  }

  let username = req.query.username; // 当前用户

  // 查询所有评论，筛掉自己from，但是保留 to=username 或 writer=username
  Comment.find({
    $or: [
      { from: { $ne: username }, to: username },
      { from: { $ne: username }, writer: username },
    ],
  })
    .populate(["pyq"]) // 让 pyq 引用数据也一起查出来
    .sort({ _id: -1 }) // 按创建顺序倒序
    .then((com) => {
      let i = 0;
      let rs = []; // 用来拼接返回给前端的评论数据

      com.forEach((item) => {
        let temp = {
          addTime: item.addTime,
          from: item.from,
          content: item.content,
          writer: item.writer,
          to: item.toString,
          pyq: "", // 稍后填朋友圈内容
          footerimg: "", // 朋友圈配图
          headerimg: "", // 评论者头像
          pyqid: item.pyq,
        };
        // 查出评论对应的朋友圈信息
        Pyq.findOne({ _id: item.pyq })
          .populate(["writer"]) // 加载朋友圈作者信息
          .then((pyq) => {
            temp.pyq = pyq.content; // 填朋友圈内容
            temp.footerimg = pyq.pimg.length ? pyq.pimg[0] : pyq.writer.avater; // 底图: 有配图取第1张，否则取用户头像

            // 再查评论者用户头像
            User.findOne({ username: item.from }).then((user) => {
              temp.headerimg = user.avater; // 评论者头像
              rs.push(temp); // 加入返回结果数组
              i++;
              if (i === com.length) {
                // 当所有评论都处理完，按时间重新排序
                rs = rs.sort(sorttime);
                res.json({ code: 0, com: rs }); // 返回给前端
              }
            });
          });
      });
    });
});

// ==================== 清除评论未读接口 ====================
router.get("/clearcomunread", (req, res) => {
  let username = req.query.username;

  // 把所有 to 当前用户的评论标记为已读 (toisn = false)
  Comment.updateMany({ to: username }, { toisn: false }).then(() => {
    // 把所有给当前用户朋友圈 writer=username 且未读的标为已读
    Comment.updateMany({ writer: username }, { isn: false }).then(() => {
      res.json({ code: 0 }); // 返回成功
    });
  });
});

// ==================== 获取未读评论接口 ====================
router.get("/getmsg", (req, res) => {
  let username = req.query.username;

  // 找出所有给当前用户的评论中 is 未读的
  Comment.find({
    $or: [
      { from: { $ne: username }, to: username, toisn: true },
      { from: { $ne: username }, writer: username, isn: true },
    ],
  }).then((rs) => {
    res.json({ code: 0, result: rs }); // 返回未读评论数组
  });
});

module.exports = router;
