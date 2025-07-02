<template>
    <div class="home-container">
        <h1>欢迎来到首页！</h1>
        <p>这是一个简单的 Home 页面。</p>
        <button class="profile-btn" @click="goProfile">个人信息</button>
        <button class="chat-btn" @click="goSingleChat">开始私聊</button>
    </div>

</template>

<script>
export default {
  name: 'Home',
  methods: {
    goProfile() {
      this.$router.push('/user/profile');
    },
    goSingleChat() {
      this.$router.push('/user/singlechat');
    }
  }
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
}
h1 {
  color: #409EFF;
  margin-bottom: 16px;
}
.profile-btn {
  margin-top: 24px;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: #409EFF;
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


</style>