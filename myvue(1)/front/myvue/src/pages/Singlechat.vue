<template>
  <div class="chat-page">
    <!-- 遮罩层 -->
    <div
      v-if="sidebarOpen"
      class="overlay"
      @mouseenter="onSidebarMouseEnter"
      @mouseleave="onSidebarMouseLeave"
      @click="sidebarOpen = false"
    ></div>
    
    <!-- 侧边栏 -->
    <div
      class="sidebar"
      :class="{ open: sidebarOpen }"
      @mouseenter="onSidebarMouseEnter"
      @mouseleave="onSidebarMouseLeave"
    >
      <div class="sidebar-toggle" @mouseenter="onSidebarMouseEnter">
        <span>&#9654;</span>
      </div>
      <div class="user-list" v-if="sidebarOpen">
        <div
          class="user-item"
          v-for="user in users"
          :key="user._id"
          @dblclick="openChat(user)"
        >
          <!-- 🔥 修改：使用avatar字段，并处理兼容性 -->
          <img :src="user.avatar || user.avater || defaultAvatar" class="avatar" @error="e => e.target.src = defaultAvatar"/>
          <span class="username">{{ user.username }}</span>
        </div>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 聊天窗口 -->
      <div v-if="activeChatUser" class="chat-window">
        <h3>与 {{ activeChatUser.username }} 聊天中</h3>
        
        <!-- 消息列表 -->
        <div class="message-list" ref="messageList">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['message-item', msg.fromSelf ? 'self' : 'other']"
          >
            <span class="msg-username">
              {{ msg.fromSelf ? '我' : msg.fromUsername }}：
            </span>
            <span class="msg-content">{{ msg.content }}</span>
            <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
        
        <!-- 消息输入区 -->
        <div class="message-input-area">
          <input
            v-model="inputMsg"
            class="message-input"
            placeholder="请输入消息"
            @keyup.enter="sendMessage"
          />
          <button class="send-btn" @click="sendMessage">发送</button>
        </div>
      </div>
      
      <!-- 欢迎页面 -->
      <div v-else class="welcome-area">
        <h2>欢迎使用聊天功能</h2>
        <p>请从左侧选择用户开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'

export default {
  name: "Singlechat",
  data() {
    return {
      sidebarOpen: true,
      users: [],
      defaultAvatar: "https://9fa6-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/img/default.png",  //8081 没有public
      activeChatUser: null,
      messages: [],
      inputMsg: "",
      currentUser: null,
      socket: null
    };
  },
  
  mounted() {
    // 获取当前用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.currentUser = userInfo;
    
    console.log('当前用户:', this.currentUser);
    
    if (!this.currentUser.username) {
      this.$message.error('请先登录');
      this.$router.push('/login');
      return;
    }
    
    this.loadUserList();
    this.initSocket();
  },

  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  
  methods: {

    initSocket() {     // 3000
      this.socket = io('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app', {
        withCredentials: true,
        transports: ['websocket', 'polling'], // 允许降级到polling
      });
      
      this.socket.on('connect', () => {
        console.log('Socket连接成功');
        this.socket.emit('join', this.currentUser.username);
      });
      
      // 🔥 接收实时消息
      this.socket.on('receive-message', (data) => {
        console.log('📨 收到实时消息:', data);
        console.log('📨 当前聊天用户:', this.activeChatUser);
        console.log('📨 消息来源用户:', data.fromUsername);
        
        // 只有当前聊天用户的消息才显示
        if (this.activeChatUser && data.fromUsername === this.activeChatUser.username) {
          this.messages.push({
            fromSelf: false,
            content: data.content,
            timestamp: data.timestamp,
            fromUsername: data.fromUsername
          });
          
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      });
    },

    createNgrokAxios() {
      return axios.create({
        headers: {
          'ngrok-skip-browser-warning': 'true',  // 🔥 关键头部
          'Content-Type': 'application/json'
        }
      });
    },
    // 加载用户列表
    async loadUserList() {
      try {
        const ngrokAxios = this.createNgrokAxios();   //3000
        const res = await ngrokAxios.get('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/user/list');
        console.log('获取用户列表:', res.data);
        
        if (res.data.code === 0 && Array.isArray(res.data.users)) {
          this.users = res.data.users.filter(user => user.username !== this.currentUser.username);
          console.log('用户列表:', this.users);
        } else {
          this.$message.error('获取用户列表失败');
        }
      } catch (err) {
        console.error('获取用户列表失败:', err);
        this.$message.error('获取用户列表失败');
      }
    },
    
    onSidebarMouseEnter() {
      this.sidebarOpen = true;
    },
    
    onSidebarMouseLeave() {
      this.sidebarOpen = false;
    },
    
    // 打开聊天
    async openChat(user) {
      this.activeChatUser = user;
      console.log('打开与用户的聊天:', user);
      
      try {
        const ngrokAxios = this.createNgrokAxios();    //3000
        const res = await ngrokAxios.get('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/message/history', {
          params: { 
            to: user._id,
            myUsername: this.currentUser.username
          }
        });
        
        if (res.data.code === 0 && Array.isArray(res.data.messages)) {
          this.messages = res.data.messages;
          console.log('历史消息:', this.messages);
          
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          this.messages = [];
          console.log('没有历史消息');
        }
      } catch (err) {
        console.error('获取历史消息失败:', err);
        this.messages = [];
        this.$message.error('获取历史消息失败');
      }
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.inputMsg.trim() || !this.activeChatUser) return;
      
      const msgContent = this.inputMsg.trim();
      
      try {
        // 1. 保存到数据库
        const ngrokAxios = this.createNgrokAxios();   //3000
        const res = await ngrokAxios.post('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/message/send', {
          fromUsername: this.currentUser.username,
          to: this.activeChatUser._id,
          content: msgContent
        });
        
        if (res.data.code === 0) {
          // 2. 立即显示在自己界面
          this.messages.push({
            fromSelf: true,
            content: msgContent,
            timestamp: new Date(),
            fromUsername: this.currentUser.username
          });
          
          // 3. 🔥 发送实时消息
          this.socket.emit('send-message', {
            toUsername: this.activeChatUser.username,
            content: msgContent
          });
          
          this.inputMsg = "";
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (err) {
        console.error('发送消息失败:', err);
        this.$message.error('消息发送失败');
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      const messageList = this.$refs.messageList;
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
/* 保持你原有的样式，添加一些新的 */
.chat-page {
  display: flex;
  height: 100vh;
  position: relative;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 40px;
  height: 100vh;
  background: #2d3a4b;
  transition: width 0.3s;
  z-index: 1001;
  overflow: hidden;
}

.sidebar.open {
  width: 260px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.08);
}

.sidebar-toggle {
  width: 40px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  background: #2d3a4b;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
}

.user-list {
  margin-left: 40px;
  padding: 20px 0;
  background: #fff;
  height: 100vh;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f5f7fa;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 1px solid #eee;
}

.username {
  font-size: 16px;
  color: #333;
}

.overlay {
  position: fixed;
  left: 260px;
  top: 0;
  width: calc(100vw - 260px);
  height: 100vh;
  background: rgba(0,0,0,0.08);
  z-index: 1000;
  transition: background 0.3s;
}

.main-content {
  flex: 1;
  margin-left: 40px;
  padding: 40px;
}

.welcome-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #666;
}

.chat-window {
  margin-top: 32px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  height: 600px;
  max-width: 800px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
}

.message-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.message-item.self {
  align-items: flex-end;
}

.message-item.other {
  align-items: flex-start;
}

.message-item.self .msg-username {
  color: #409EFF;
}

.message-item.other .msg-username {
  color: #67c23a;
}

.msg-username {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 12px;
}

.msg-content {
  word-break: break-all;
  background: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 70%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-item.self .msg-content {
  background: #409EFF;
  color: white;
}

.msg-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.message-input-area {
  display: flex;
  align-items: center;
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

.message-input {
  flex: 1;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}

.message-input:focus {
  border-color: #409EFF;
}

.send-btn {
  margin-left: 12px;
  padding: 8px 20px;
  background: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover {
  background: #3076c9;
}
</style>