let express = require("express");
let router = express.Router();
let axios = require("axios");

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = "sk-b3a98ff02a76415eb97a75fa57d8364c"; // 替换为您的DeepSeek密钥

router.post("/aimessage", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "没有收到消息" });
  }

  try {
    console.log("用户消息:", userMessage);

    // 调用 DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat", // 使用 deepseek-chat 模型
        messages: [
          { role: "system", content: "你是一个乐于助人的AI助手" },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30秒超时
      }
    );

    const aiReply = response.data.choices[0].message.content.trim();
    console.log("AI 回复:", aiReply);

    return res.json({ reply: aiReply });
  } catch (error) {
    console.error(
      "调用 DeepSeek API 失败:",
      error.response?.data || error.message
    );

    let errorMsg = "AI服务暂时不可用";
    if (error.response?.status === 429) {
      errorMsg = "请求过于频繁，请稍后再试";
    } else if (error.response?.status === 401) {
      errorMsg = "API密钥无效";
    }

    return res.status(500).json({
      error: errorMsg,
      detail: error.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = router;
