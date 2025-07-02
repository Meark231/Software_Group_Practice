<template>
  <div id="app">
    <el-container direction="vertical" style="height: 100vh">
      <el-header
        style="
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          color: white;
        "
      >
        <h1 style="text-align: center; margin: 0">Ds AI 对话</h1>
        <p
          style="
            text-align: center;
            margin: 5px 0 0;
            font-size: 14px;
            opacity: 0.8;
          "
        >
          孤独寂寞时陪伴你的ai聊天~
        </p>
      </el-header>

      <el-main style="background-color: #f9fafc; padding: 20px">
        <!-- 聊天消息区域 -->
        <div class="chat-container" ref="chatContainer">
          <div v-for="(msg, index) in messages" :key="index" class="message">
            <div :class="msg.from === 'user' ? 'user-message' : 'ai-message'">
              <div class="message-content">
                <div class="message-header">
                  <span v-if="msg.from === 'user'">👤 您</span>
                  <span v-else>🤖 DeepSeek AI</span>
                </div>
                <div class="message-text">{{ msg.text }}</div>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="loading-indicator">
            <i
              class="el-icon-loading"
              style="margin-right: 10px; font-size: 18px"
            ></i>
            AI思考中...
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
            v-model="userInput"
            placeholder="输入您的问题..."
            @keyup.enter="sendMessage"
            size="large"
            clearable
          >
            <template #prepend>
              <i class="el-icon-chat-line-round" style="font-size: 18px"></i>
            </template>
          </el-input>

          <el-button
            type="primary"
            @click="sendMessage"
            size="large"
            :disabled="isLoading"
            style="margin-left: 10px; height: 40px"
          >
            发送
          </el-button>
        </div>

        <!-- 状态栏 -->
        <div class="status-bar">
          <span>当前模型: deepseek-chat</span>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";

// 简单估算费用 (实际按API返回的usage计算更准确)
function estimateCost(input, output) {
  // 简单估算：1个汉字≈1.5 token，1个英文≈1 token
  const inputTokens = input.length * 1.3;
  const outputTokens = output.length * 1.3;
  return (inputTokens + outputTokens) / 1000000; // 百万tokens费用
}

export default {
  data() {
    return {
      userInput: "",
      messages: [],
      isLoading: false,
      costEstimate: 0,
    };
  },
  methods: {
    async sendMessage() {
      const input = this.userInput.trim();
      if (!input) return;

      // 添加用户消息
      this.messages.push({ from: "user", text: input });
      this.userInput = "";
      this.isLoading = true;

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        // 发送请求到后端
        const response = await axios.post(
          "http://localhost:3000/api/aichat/aimessage",
          { message: input }
        );

        const aiReply = response.data.reply;

        // 添加AI回复
        this.messages.push({ from: "ai", text: aiReply });

        // 估算费用
        this.costEstimate += estimateCost(input, aiReply);
      } catch (error) {
        console.error("请求失败:", error);

        let errorMsg = "AI服务暂时不可用";
        if (error.response?.data?.error) {
          errorMsg = error.response.data.error;
        } else if (error.message.includes("Network Error")) {
          errorMsg = "无法连接到服务器，请检查网络";
        }

        this.messages.push({
          from: "ai",
          text: errorMsg,
        });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    scrollToBottom() {
      const container = this.$refs.chatContainer;
      if (container) {
        // 使用setTimeout确保在DOM更新后滚动
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 100);
      }
    },
  },
  mounted() {
    // 添加欢迎消息
    this.messages.push({
      from: "ai",
      text: "您好！我是基于 DeepSeek 大模型的AI助手。请问有什么可以帮您的？",
    });

    // 初始滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
};
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
}

.message {
  margin-bottom: 20px;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-message .message-content {
  background: linear-gradient(135deg, #e3eeff, #d9e7ff);
  border: 1px solid #c2d9ff;
}

.ai-message .message-content {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  border: 1px solid #c5ebff;
}

.message-header {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.85em;
  color: #5a6c8c;
}

.message-text {
  line-height: 1.6;
  font-size: 1.05em;
  white-space: pre-wrap;
}

.input-area {
  display: flex;
  margin-bottom: 10px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  color: #5a6c8c;
  font-size: 15px;
  font-weight: 500;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #7a8ca5;
  padding: 5px 10px;
  background-color: #f0f5ff;
  border-radius: 6px;
}

/* 图标旋转动画 */
.el-icon-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
