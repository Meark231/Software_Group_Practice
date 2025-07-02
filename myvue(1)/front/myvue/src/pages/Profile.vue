<template>
  <div class="profile-container">
    <h1>个人信息</h1>
    <div class="profile-card">
      <div class="avatar-section">
        <img :src="userInfo.avatar || '/img/default.png' " class="avatar-img" @click="changeAvatar" alt="头像" />
        <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarSelected" />
        <p class="avatar-tip">点击头像更换图片</p>
      </div>
      <div class="info-section">
        <div class="info-row">
          <span class="label">用户名：</span>
          <span>{{ userInfo.username }}</span>
        </div>
        <div class="info-row">
            <span class="label">个性签名：</span>
            <span>{{ userInfo.signature }}</span>
            </div>
            <div class="info-row">
            <el-input
                v-model="signature"
                class="signature-input"
                placeholder="请输入个性签名"
                maxlength="50"
                show-word-limit
                :clearable="true"
            />
            <el-button type="primary" size="mini" @click="updateSignature" style="margin-left:8px;">保存</el-button>
            </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {
        username: '',
        avatar: '',
        signature: ''
      },
      signature: ''
    };
  },
  
  created() {
    console.log('🔥 Profile页面created钩子执行');
    this.fetchUserInfo();
  },
  methods: {
   

    async fetchUserInfo() {
      console.log('🔥 fetchUserInfo方法开始执行');
  try {
    // 🔥 从localStorage或Vuex获取用户名
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const username = userInfo.username || this.$store.state.user.userInfo.username;
    
    if (!username) {
      this.$message.error('用户名不存在，请重新登录');
      return;
    }
                                         //3000
    const res = await axios.get(`https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/user/profile?username=${username}`, {
      withCredentials: true,
      headers: {
        'ngrok-skip-browser-warning': 'true'  // 🔥 添加这个头部
      }
    });
    
    console.log('🔥 fetchUserInfo请求结果:', res.data);
    
    if (res.data.code === 0 && res.data.userInfo) {
      this.userInfo = { ...res.data.userInfo };
      this.signature = '';
      this.$store.commit('user/SET_USER_INFO', this.userInfo);
      
      const currentUserData = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const updatedUserData = { ...currentUserData, ...this.userInfo };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserData));

      
    }
  } catch (error) {
    console.error('🔥 API请求失败:', error);
    this.$message.error('获取用户信息失败');
  }
},

    changeAvatar() {
      this.$refs.avatarInput.click();
    },
    async onAvatarSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      // 本地预览
      const reader = new FileReader();
      reader.onload = async (evt) => {
        this.userInfo.avatar = evt.target.result;
        // 上传到后端
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('username', this.userInfo.username); // 🔥 添加用户名到表单数据
        try {                                        //3000
          const res = await axios.post('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data',
              'ngrok-skip-browser-warning': 'true' // 🔥 添加这个头部
             },
            withCredentials: true // 确保携带 cookie
          });
          if (res.data.code === 0) {
            this.$message.success('头像更新成功');

            this.userInfo.avatar = res.data.avatar; // 使用返回的头像地址
            console.log('🔥 头像更新成功:', res.data.avatar);
            // 🔥 更新Vuex和localStorage都使用服务器路径
                const updatedUserInfo = { ...this.userInfo, avatar: res.data.avatar };
                this.$store.commit('user/SET_USER_INFO', updatedUserInfo);
                
                const currentUserData = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const updatedUserData = { ...currentUserData, avatar: res.data.avatar };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserData));

          } else {
            this.fetchUserInfo(); // 重新获取用户信息
            this.$message.error(res.data.msg || '头像更新失败');
          }
        } catch {
          this.fetchUserInfo(); // 重新获取用户信息
          this.$message.error('头像上传失败');
        }
      };
      reader.readAsDataURL(file);
    },
    async updateSignature() {
      try {                                    //3000
        const res = await axios.post('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/user/signature', {
          username: this.userInfo.username,
          signature: this.signature
        }, {
          withCredentials: true,
          headers: {
            'ngrok-skip-browser-warning': 'true' // 🔥 添加这个头部
          }
        });
        if (res.data.code === 0) {
          this.$message.success('签名更新成功');
          this.userInfo.signature = this.signature;
          this.$store.commit('user/SET_USER_INFO', { ...this.userInfo });

          const currentUserData = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const updatedUserData = { ...currentUserData, signature: this.signature };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
        } else {
          this.$message.error(res.data.msg || '签名更新失败');
        }
      } catch {
        this.$message.error('签名更新失败');
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 60vh;
}
.profile-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 32px 40px;
  margin-top: 32px;
  display: flex;
  align-items: flex-start;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;
}
.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #409EFF;
}
.avatar-tip {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}
.info-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.info-row {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
}
.label {
  font-weight: bold;
  margin-right: 8px;
}
.signature-input {
  width: 240px;
}
</style>