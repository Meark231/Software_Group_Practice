
<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
        <div style="position: relative;">
        <i
          class="el-icon-arrow-left"
          style="position: absolute; left: 0; top: 0; font-size: 22px; color: #409EFF; cursor: pointer;"
          @click="goback"
        ></i>
      <h2 class="login-title">用户注册</h2>
      </div>
      <el-form :model="form" ref="registerForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" style="width: 100%;">注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    goback() {
      this.$router.go(-1);
    },
    async handleRegister() {
      if (!this.form.username || !this.form.password || !this.form.confirmPassword) {
        this.$message.error('请填写所有信息');
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.$message.error('两次输入的密码不一致');
        return;
      }

      try {
        const response = await axios.post('/api/auth/register', {
          username: this.form.username,
          password: this.form.password,
          confirmPassword: this.form.confirmPassword
        });

        if (response.data.code === 0) {
          // ✅ 保存 uid 和 username
          const { uid, username } = response.data.data;
          localStorage.setItem('uid', uid);
          localStorage.setItem('username', username);

          this.$message.success(response.data.message || '注册成功');
          // 跳转到登录页
          this.$router.push({ name: 'Login' });
        } else {
          this.$message.error(response.data.message || '注册失败');
        }
      } catch (error) {
        this.$message.error(error.response?.data?.message || '注册失败，请稍后再试');
      }
    }
  }
}

</script>


<style>
.login-title {
  text-align: center;
  margin-bottom: 30px;
}
</style>