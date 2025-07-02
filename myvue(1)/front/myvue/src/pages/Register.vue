
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
          <el-input v-model="form.username" placeholder="请输入用户名" maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" maxlength="50" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" maxlength="50" show-password @keyup.enter="handleRegister"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" style="width: 100%;" :loading="registerLoading">
            {{ registerLoading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <div style="text-align: center; font-size: 12px; color: #888;">
            已有账号？
            <router-link to="/login" style="color: #409EFF;">去登录</router-link>
          </div>
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
      },
        registerLoading: false  // 注册按钮加载状态
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
      // 注册逻辑

      this.registerLoading = true;  // 设置加载状态

      try{                                      // 3000
        const res = await axios.post('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/register',{
            username: this.form.username,
            password: this.form.password
        });
        if(res.data.code === 0){
            this.$message.success('注册成功');

            this.form = {
            username: '',
            password: '',
            confirmPassword: ''
          };
            this.$router.push({ name: 'Login' });
            } else {
            switch (res.data.code) {
            case 1:
              this.$message.error('用户名或密码不能为空');
              break;
            case 2:
              this.$message.error('用户名已存在，请选择其他用户名');
              break;
            case 3:
              this.$message.error('用户名格式不正确');
              break;
            default:
              this.$message.error(res.data.msg || '注册失败');
          }
        }
      }catch(e){
        this.$message.error('网络错误或服务器无响应');
        console.error(e);
        }finally{
        this.registerLoading = false;  // 重置加载状态
        }
    }
  }
}

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
  max-width: 450px;
  border-radius: 12px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
  font-weight: 600;
  padding-top: 8px;
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

/* 返回按钮样式 */
.el-icon-arrow-left:hover {
  color: #66b1ff !important;
  transform: translateX(-2px);
  transition: all 0.2s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    margin: 0 10px;
  }
  
  .el-form-item__label {
    width: 80px !important;
  }
}
</style>