<template>
  <div class="register">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <input type="text" v-model="name" placeholder="请输入姓名" required />
      <input type="email" v-model="email" placeholder="请输入邮箱" required />
      <input type="password" v-model="password" placeholder="请输入密码" required />
      <button type="submit">注册</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
    };
  },
  methods: {
    async handleRegister() {
      try {
        await axios.post('http://localhost:5000/api/auth/register', {
          name: this.name,
          email: this.email,
          password: this.password,
        });

        alert('注册成功');
        // 注册成功后，自动跳转到登录页面
        this.$router.push('/login');
      } catch (error) {
        // 处理错误信息
        alert(error.response?.data?.message || '注册失败');
      }
    },
  },
};
</script>

<style scoped>
/* 样式自定义 */
.register {
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

