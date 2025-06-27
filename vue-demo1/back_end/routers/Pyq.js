// 引入模型：朋友圈（Pyq）
let Pyq = require("../models/Pyq");

// 引入模型：评论（Comment）
let Comment = require("../models/Comment");

// 引入 Express 框架
let express = require("express");

// 创建一个路由对象，用于定义接口路径
let router = express.Router();

/**
 * ========================
 * 接口一：删除朋友圈及评论
 * 路径：POST /delpyq
 * 功能：删除指定 ID 的朋友圈，如果包含评论，也一并删除
 * 请求体参数：{ id: "朋友圈ID" }
 * ========================
 */
router.post("/delpyq", (req, res) => {
  // 获取要删除的朋友圈ID
  let id = req.body.id;

  // 根据ID查找对应的朋友圈文档
  Pyq.findOne({ _id: id })
    .then((pyq) => {
      // 如果找不到该朋友圈，返回404错误
      if (!pyq) {
        return res.status(404).json({ code: 1, msg: "找不到该朋友圈" });
      }

      // 如果该朋友圈没有评论
      if (pyq.comments.length === 0) {
        // 直接删除该朋友圈
        return Pyq.deleteOne({ _id: id }).then(() => {
          // 删除成功后返回结果
          res.json({ code: 0, msg: "删除成功" });
        });
      }

      // 如果该朋友圈有评论，需要先删除所有评论
      return Promise.all(
        // 遍历所有评论ID，生成删除评论的 Promise 数组
        pyq.comments.map((commentId) => Comment.deleteOne({ _id: commentId }))
      )
        .then(() => {
          // 所有评论删除完后，再删除朋友圈
          return Pyq.deleteOne({ _id: id });
        })
        .then(() => {
          // 最终返回删除成功信息
          res.json({ code: 0, msg: "删除成功" });
        });
    })
    .catch((err) => {
      // 如果出错，打印错误并返回 500 状态码
      console.error("删除朋友圈出错:", err);
      res.status(500).json({ code: 2, msg: "服务器内部错误" });
    });
});

/**
 * ========================
 * 接口二：获取所有朋友圈
 * 路径：GET /
 * 功能：获取所有朋友圈（含评论和发帖人信息）
 * ========================
 */
router.get("/", (req, res) => {
  // 获取请求中用户信息
  let userInfo = req.userInfo;

  // 查询所有朋友圈
  Pyq.find()
    .sort({ _id: -1 }) // 按照ID倒序排列（越新的越靠前）
    .populate(["writer", "comments"]) // 填充发帖人信息和评论详情
    .then((data) => {
      // 返回查询结果和用户信息
      res.json({
        code: 0,
        userInfo,
        data,
      });
    })
    .catch((err) => {
      // 查询失败处理
      console.error("获取朋友圈列表失败:", err);
      res.status(500).json({ code: 1, msg: "服务器内部错误" });
    });
});

/**
 * ========================
 * 接口三：获取某用户的朋友圈
 * 路径：GET /tPyqList?id=<用户ID>
 * 功能：获取指定用户发布的所有朋友圈（含评论和发帖人信息）
 * ========================
 */
router.get("/tPyqList", (req, res) => {
  // 从查询字符串中获取用户ID（即发帖人ID）
  let writer = req.query.id;

  // 查找所有该用户发布的朋友圈
  Pyq.find({ writer })
    .sort({ _id: -1 }) // 按时间倒序排列
    .populate(["writer", "comments"]) // 填充发帖人和评论信息
    .then((data) => {
      // 返回查询结果
      res.json(data);
    })
    .catch((err) => {
      // 错误处理
      console.error("获取用户朋友圈失败:", err);
      res.status(500).json({ code: 1, msg: "服务器内部错误" });
    });
});

// 导出路由对象，供主服务器文件使用
module.exports = router;
