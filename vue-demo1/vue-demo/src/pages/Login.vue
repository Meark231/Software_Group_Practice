/* eslint-disable */
<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <h2 class="login-title">用户登录</h2>
      <el-form :model="form" ref="loginForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
        </el-form-item>
        <el-form-item>
            <div style="text-align: right; font-size: 12px; color: #888;">
                没有账号？
            <router-link to="/register" style="color: #409EFF;">请注册</router-link>
  </div>
</el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
    name: 'Login',
    data() {
        return {
            // 登录相关数据
            form: {
                username: '',
                password: ''
            }
        };
    },
    methods: {
        // 登录方法
        handleLogin() {
            // 这里可以添加登录逻辑，比如调用 API 验证用户
            if (this.form.username && this.form.password) {
                // 假设登录成功
                this.$message.success('登录成功');
                // 跳转到首页或其他页面
                this.$router.push({ name: 'Home' });
            } else {
                this.$message.error('请输入账号和密码');
            }
        }
    }
};

</script>

<style>
.login-title {
  text-align: center;
  margin-bottom: 30px;
}

</style>