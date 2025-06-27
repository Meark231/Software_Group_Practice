<template>
  <div class="login">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <input type="email" v-model="email" placeholder="请输入邮箱" required />
      <input type="password" v-model="password" placeholder="请输入密码" required />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password,
        });

        // 登录成功，保存 token
        localStorage.setItem('authToken', response.data.token);

        // 提示成功，并跳转到 Dashboard 页面
        alert('登录成功');
        this.$router.push('/dashboard');
      } catch (error) {
        // 处理错误信息
        alert(error.response?.data?.message || '登录失败');
      }
    },
  },
};
</script>

<style scoped>
/* 样式自定义 */
.login {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

