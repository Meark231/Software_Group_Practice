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
          <el-input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;" :loading="loginLoading">
            {{ loginLoading ? '登录中...' : '登录' }}
          </el-button>
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
import axios from 'axios';  // 很重要
export default {
    name: 'Login',
    data() {
        return {
            // 登录相关数据
            form: {
                username: '',
                password: ''
            },
            loginLoading: false  // 登录按钮加载状态
        };
    },
    created() {
        // 🔥 进入登录页面时清除登录状态
        this.$store.dispatch('user/logout');
        console.log('进入登录页面，已清除登录状态');
    },
    methods: {
        // 登录方法
        async handleLogin(){
            if (!this.form.username) {
                this.$message.error('请输入用户名');
                return;
            }
            if (!this.form.password) {
                this.$message.error('请输入密码');
                return;
            }

            this.loginLoading = true;

            try {
                const response = await axios.post('https://ae88-2001-250-4001-208-addd-61f-1192-be83.ngrok-free.app/api/login', {
                    username: this.form.username,
                    password: this.form.password
                }, {
                    withCredentials: true
                });

                const result = response.data;
                
                if (result.code === 0) {
                    this.$message.success('登录成功');
                    
                    // 存储到Vuex
                    this.$store.dispatch('user/login', {
                        username: this.form.username,
                        isLoggedIn: true
                    });
                    
                    // 跳转到首页
                    this.$router.push('/home');
                    
                } else {
                    this.$message.error(result.msg || '登录失败');
                }
                
            } catch (error) {
                console.error('登录请求失败:', error);
                this.$message.error('网络连接失败，请检查后端服务器是否启动');
            }finally {
                this.loginLoading = false;
            }

        }
    }
};

</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
  font-weight: 600;
}

/* 覆盖Element UI样式 */
.el-card {
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.el-form-item {
  margin-bottom: 22px;
}

.el-input__inner {
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.el-input__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.el-button--primary {
  background: #409EFF;
  border-color: #409EFF;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.el-button--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style>