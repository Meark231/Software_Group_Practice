<template>
  <div class="home-container">
    <!-- 🔥 只添加退出按钮，不显示用户名 -->
    <div class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>

    <h1>欢迎来到首页！</h1>
    <p>这是一个简单的 Home 页面。</p>
    <button class="profile-btn" @click="goProfile">个人信息</button>
    <button class="chat-btn" @click="goSingleChat">开始私聊</button>
    <button class="group-chat-btn" @click="goGroupChat">开始群聊</button>
    <!-- 🔥 新增：朋友圈按钮 -->
    <button class="pyq-btn" @click="goPyq">朋友圈</button>
    <button class="ai-btn" @click="goai">ai对话</button>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    goProfile() {
      this.$router.push("/user/profile");
    },
    goSingleChat() {
      this.$router.push("/user/singlechat");
    },
    goGroupChat() {
      this.$router.push("/user/groupchat");
    },
    // 🔥 新增：跳转到朋友圈
    goPyq() {
      this.$router.push("/user/pyq");
    },
    goai() {
      this.$router.push("/user/ai");
    },

    // 🔥 简单的退出登录
    logout() {
      // 直接清空
      localStorage.removeItem("userInfo");
      this.$store.commit("user/CLEAR_USER_DATA");

      this.$message.success("退出登录成功");
      this.$router.push("/login");
    },
  },
};
</script>

<style>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  font-family: "Segoe UI", Arial, sans-serif;
  position: relative;
}

/* 🔥 右上角退出按钮 */
.logout-section {
  position: absolute;
  top: 20px;
  right: 20px;
}

.logout-btn {
  padding: 6px 16px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  background: #f56c6c;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #e85c5c;
}

h1 {
  color: #409eff;
  margin-bottom: 16px;
}

.profile-btn {
  margin-top: 24px;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.profile-btn:hover {
  background: #3076c9;
}

.chat-btn {
  margin-top: 16px;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: #67c23a;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-btn:hover {
  background: #4ea43a;
}

.group-chat-btn {
  margin-top: 16px;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: #e6a23c;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.group-chat-btn:hover {
  background: #d4902b;
}

/* 🔥 新增：朋友圈按钮样式 */
.pyq-btn {
  margin-top: 16px;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: #ff6b9d;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.pyq-btn:hover {
  background: #e55a8a;
}
.ai-btn {
  margin-top: 16px;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: #31f1fe;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.ai-btn:hover {
  background: #2beaf4;
}
</style>
