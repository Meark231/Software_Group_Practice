// 引入 express 框架
let express = require("express");

// 创建 express 路由对象
let router = express.Router();

// 引入 User 模型（用户信息）
let User = require("../models/User");

// 引入 Comment 模型（评论信息）
let Comment = require("../models/Comment");

// 引入 Pyq 模型（朋友圈信息）
let Pyq = require("../models/Pyq");

// ------------------------------
// 添加评论接口（POST /comment/）
// ------------------------------
router.post("/", async (req, res) => {
  try {
    // 从请求体中解构出需要的数据
    const { content, from, to = "", pyq: pyqId, writer } = req.body;

    // 创建一条新的评论并保存到数据库中
    const comment = await new Comment({
      content,
      from,
      to,
      pyq: pyqId,
      writer,
    }).save();

    // 将评论的 ID 添加到对应朋友圈的 comments 数组中
    await Pyq.updateOne(
      { _id: pyqId }, // 目标朋友圈
      { $push: { comments: comment._id } } // 添加评论ID到数组
    );

    // 返回成功响应
    res.json({ code: 0, msg: "评论成功" });
  } catch (err) {
    // 捕获异常，返回错误信息
    res.status(500).json({ code: 1, msg: "评论失败", error: err.message });
  }
});

// -----------------------------------------------------
// 获取与当前用户相关的评论通知（GET /comment/getcom）
// -----------------------------------------------------
router.get("/getcom", async (req, res) => {
  try {
    // 从查询参数中获取用户名
    const username = req.query.username;

    // 查询别人发给我的评论，或评论了我发的朋友圈的评论
    const comments = await Comment.find({
      $or: [
        { from: { $ne: username }, to: username }, // 评论提到我（我被 @）
        { from: { $ne: username }, writer: username }, // 评论的是我发的朋友圈
      ],
    })
      .populate("pyq") // 填充 pyq 字段（朋友圈）
      .sort({ _id: -1 }); // 按评论时间倒序排列

    // 处理所有评论，补充用户头像、朋友圈内容等信息
    const result = await Promise.all(
      comments.map(async (item) => {
        // 获取对应的朋友圈及其作者信息
        const pyq = await Pyq.findOne({ _id: item.pyq }).populate("writer");

        // 获取评论发送者的用户头像信息
        const user = await User.findOne({ username: item.from });

        // 构造返回结果中的一项
        return {
          addTime: item.addTime, // 评论时间
          from: item.from, // 评论发送者用户名
          content: item.content, // 评论内容
          writer: item.writer, // 朋友圈作者
          to: item.to, // 评论接收者
          pyq: pyq?.content || "", // 朋友圈内容（若不存在则为空）
          footerimg: pyq?.pimg?.[0] || pyq?.writer?.avater || "", // 配图或作者头像
          headerimg: user?.avater || "", // 评论者头像
          pyqid: item.pyq, // 朋友圈 ID
        };
      })
    );

    // 按评论时间升序排序（老的在前）
    result.sort((a, b) => new Date(a.addTime) - new Date(b.addTime));

    // 返回评论列表
    res.json({ code: 0, com: result });
  } catch (err) {
    // 错误处理
    res.status(500).json({ code: 1, msg: "获取评论失败", error: err.message });
  }
});

// --------------------------------------------------------------------
// 清除某个用户的评论未读状态（GET /comment/clearcomunread?username=xxx）
// --------------------------------------------------------------------
router.get("/clearcomunread", async (req, res) => {
  try {
    // 获取用户名
    const username = req.query.username;

    // 并发执行两个 updateMany：一个清除 to，我被评论；另一个清除 writer，我的朋友圈被评论
    await Promise.all([
      Comment.updateMany({ to: username }, { toisn: false }), // 标记别人给我的评论为“已读”
      Comment.updateMany({ writer: username }, { isn: false }), // 标记别人评论我发的朋友圈为“已读”
    ]);

    // 返回成功结果
    res.json({ code: 0 });
  } catch (err) {
    // 错误处理
    res.status(500).json({ code: 1, msg: "清除失败", error: err.message });
  }
});

// ----------------------------------------------------------
// 获取当前用户的未读消息（GET /comment/getmsg?username=xxx）
// ----------------------------------------------------------
router.get("/getmsg", async (req, res) => {
  try {
    // 获取用户名
    const username = req.query.username;

    // 查找所有别人发给我的未读评论 or 评论了我朋友圈的未读评论
    const rs = await Comment.find({
      $or: [
        { from: { $ne: username }, to: username, toisn: true }, // 我被 @ 且未读
        { from: { $ne: username }, writer: username, isn: true }, // 我发的朋友圈被评论且未读
      ],
    });

    // 返回未读评论列表
    res.json({ code: 0, result: rs });
  } catch (err) {
    // 错误处理
    res.status(500).json({ code: 1, msg: "获取消息失败", error: err.message });
  }
});

// 将 router 暴露出去供 app.js 使用
module.exports = router;
