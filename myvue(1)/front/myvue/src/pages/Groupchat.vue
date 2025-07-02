<!-- front/myvue/src/pages/Groupchat.vue -->
<template>
  <div class="chat-page">
    <!-- 左侧栏 -->
    <div class="sidebar">
      <!-- 用户列表区域 -->
      <div class="user-section">
        <h3>选择用户创建群聊</h3>
        <div class="user-list">
          <div
            class="user-item"
            v-for="user in users"
            :key="user._id"
            @click="toggleUserSelection(user)"
            :class="{ selected: selectedUsers.includes(user._id) }"
          >
            <img :src="user.avatar || defaultAvatar" class="avatar"/>
            <span class="username">{{ user.username }}</span>
            <span v-if="selectedUsers.includes(user._id)" class="check">✓</span>
          </div>
        </div>
        <div class="create-section">
          <input v-model="newGroupName" placeholder="输入群聊名称" class="group-name-input"/>
          <button @click="createGroup" :disabled="selectedUsers.length === 0 || !newGroupName.trim()">
            创建群聊
          </button>
        </div>
      </div>
      
      <!-- 群聊列表区域 -->
      <div class="group-section">
        <h3>我的群聊</h3>
        <div class="group-list">
          <div
            class="group-item"
            v-for="group in groups"
            :key="group._id"
            @click="openGroupChat(group)"
            :class="{ active: activeGroup && activeGroup._id === group._id }"
          >
            <div class="group-avatar">群</div>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="member-count">{{ group.members.length }}人</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧聊天区域 -->
    <div class="main-content">
      <div v-if="activeGroup" class="chat-window">
        <div class="chat-header">
          <h3>{{ activeGroup.name }} ({{ activeGroup.members.length }}人)</h3>
        </div>
        
        <!-- 消息列表 -->
        <div class="message-list" ref="messageList">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['message-item', msg.fromSelf ? 'self' : 'other']"
          >
            <span class="msg-username">
              {{ msg.fromSelf ? '我' : msg.senderUsername }}：
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
            placeholder="请输入群消息"
            @keyup.enter="sendGroupMessage"
          />
          <button class="send-btn" @click="sendGroupMessage">发送</button>
        </div>
      </div>
      
      <!-- 欢迎页面 -->
      <div v-else class="welcome-area">
        <h2>欢迎使用群聊功能</h2>
        <p>左侧选择用户创建群聊，或点击已有群聊开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'

export default {
  name: "Groupchat",
  data() {
    return {
      users: [],
      groups: [],
      selectedUsers: [],
      newGroupName: '',
      defaultAvatar: "https://9fa6-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/img/default.png", // 8081  没有public
      activeGroup: null,
      messages: [],
      inputMsg: "",
      currentUser: null,
      socket: null
    };
  },
  
  mounted() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.currentUser = userInfo;
    
    if (!this.currentUser.username) {
      this.$message.error('请先登录');
      this.$router.push('/login');
      return;
    }
    
    this.loadUserList();
    this.loadGroupList();
    this.initSocket();
  },

  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  
  methods: {
    initSocket() {  // 3000
      this.socket = io('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app', {
        withCredentials: true,
        transports: ['websocket', 'polling']  // 🔥 移除了extraHeaders
      });
      
      this.socket.on('connect', () => {
        console.log('Socket连接成功');
        this.socket.emit('join', this.currentUser.username);
      });
      
      // 接收群聊实时消息
      this.socket.on('receive-group-message', (data) => {
        console.log('收到群聊消息:', data);
        
        if (this.activeGroup && data.groupId === this.activeGroup._id) {
          this.messages.push({
            fromSelf: false,
            content: data.content,
            timestamp: data.timestamp,
            senderUsername: data.senderUsername
          });
          
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      });
    },

    // 🔥 创建带ngrok绕过头部的axios实例
    createNgrokAxios() {
      return axios.create({
        headers: {
          'ngrok-skip-browser-warning': 'true',  // 🔥 关键头部
          'Content-Type': 'application/json'
        }
      });
    },

    // 🔥 加载用户列表 - 已添加ngrok绕过
    async loadUserList() {
      try {
        const ngrokAxios = this.createNgrokAxios();  // 3000
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

    // 🔥 加载群聊列表 - 已添加ngrok绕过
    async loadGroupList() {
      try {
        const ngrokAxios = this.createNgrokAxios();  //3000
        const res = await ngrokAxios.get('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/group/list', {
          params: { username: this.currentUser.username }
        });
        console.log('获取群聊列表:', res.data);
        
        if (res.data.code === 0 && Array.isArray(res.data.groups)) {
          this.groups = res.data.groups;
          console.log('群聊列表:', this.groups);
        } else {
          this.$message.error('获取群聊列表失败');
        }
      } catch (err) {
        console.error('获取群聊列表失败:', err);
        this.$message.error('获取群聊列表失败');
      }
    },
    
    // 切换用户选择状态
    toggleUserSelection(user) {
      const index = this.selectedUsers.indexOf(user._id);
      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      } else {
        this.selectedUsers.push(user._id);
      }
    },
    
    // 🔥 创建群聊 - 已添加ngrok绕过
    async createGroup() {
      if (!this.newGroupName.trim() || this.selectedUsers.length === 0) return;
      
      try {
        const selectedUsernames = this.users
          .filter(user => this.selectedUsers.includes(user._id))
          .map(user => user.username);
        
        const ngrokAxios = this.createNgrokAxios();  // 3000
        const res = await ngrokAxios.post('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/group/create', {
          groupName: this.newGroupName.trim(),
          creatorUsername: this.currentUser.username,
          memberUsernames: selectedUsernames
        });
        
        if (res.data.code === 0) {
          this.$message.success('群聊创建成功');
          this.newGroupName = '';
          this.selectedUsers = [];
          this.loadGroupList();
        } else {
          this.$message.error(res.data.msg || '创建群聊失败');
        }
      } catch (err) {
        console.error('创建群聊失败:', err);
        this.$message.error('创建群聊失败');
      }
    },
    
    // 🔥 打开群聊 - 已添加ngrok绕过
    async openGroupChat(group) {
      // 离开之前的群聊房间
      if (this.activeGroup && this.socket) {
        this.socket.emit('leave-group', this.activeGroup._id);
      }
      
      this.activeGroup = group;
      console.log('打开群聊:', group);
      
      // 加入新的群聊房间
      if (this.socket) {
        this.socket.emit('join-group', group._id);
      }
      
      try {
        const ngrokAxios = this.createNgrokAxios();  //3000
        const res = await ngrokAxios.get('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/group/message/history', {
          params: { 
            groupId: group._id,
            username: this.currentUser.username
          }
        });
        
        if (res.data.code === 0 && Array.isArray(res.data.messages)) {
          this.messages = res.data.messages;
          console.log('群聊历史消息:', this.messages);
          
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          this.messages = [];
          console.log('没有群聊历史消息');
        }
      } catch (err) {
        console.error('获取群聊历史消息失败:', err);
        this.messages = [];
        this.$message.error('获取群聊历史消息失败');
      }
    },
    
    // 🔥 发送群消息 - 已添加ngrok绕过
    async sendGroupMessage() {
      if (!this.inputMsg.trim() || !this.activeGroup) return;
      
      const msgContent = this.inputMsg.trim();
      
      try {
        // 1. 保存到数据库
        const ngrokAxios = this.createNgrokAxios();  //3000
        const res = await ngrokAxios.post('https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app/api/group/message/send', {
          senderUsername: this.currentUser.username,
          groupId: this.activeGroup._id,
          content: msgContent
        });
        
        if (res.data.code === 0) {
          // 2. 立即显示在自己界面
          this.messages.push({
            fromSelf: true,
            content: msgContent,
            timestamp: new Date(),
            senderUsername: this.currentUser.username
          });
          
          // 3. 🔥 发送实时消息
          if (this.socket) {
            this.socket.emit('send-group-message', {
              groupId: this.activeGroup._id,
              content: msgContent
            });
          }
          
          this.inputMsg = "";
          this.$nextTick(() => {
            this.scrollToBottom();
          });
          
          console.log('群消息发送成功');
        } else {
          this.$message.error(res.data.msg || '群消息发送失败');
        }
      } catch (err) {
        console.error('发送群消息失败:', err);
        this.$message.error('发送群消息失败');
      }
    },
    
    scrollToBottom() {
      const messageList = this.$refs.messageList;
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    },
    
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
.chat-page {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 350px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.user-section, .group-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.user-section h3, .group-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.user-list, .group-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.user-item, .group-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: background 0.2s;
}

.user-item:hover, .group-item:hover {
  background: #e6f7ff;
}

.user-item.selected {
  background: #409EFF;
  color: white;
}

.group-item.active {
  background: #409EFF;
  color: white;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.group-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  margin-right: 10px;
  background: #67c23a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.username, .group-name {
  flex: 1;
  font-size: 14px;
}

.member-count {
  font-size: 12px;
  opacity: 0.8;
}

.check {
  color: white;
  font-weight: bold;
}

.create-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
}

.group-name-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.group-name-input:focus {
  border-color: #409EFF;
}

.create-section button {
  width: 100%;
  padding: 8px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.create-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.chat-header h3 {
  margin: 0;
  color: #333;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.message-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message-item.self {
  align-items: flex-end;
}

.message-item.other {
  align-items: flex-start;
}

.msg-username {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.msg-content {
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-item.self .msg-content {
  background: #409EFF;
  color: white;
}

.msg-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
}

.message-input-area {
  display: flex;
  padding: 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.message-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: #409EFF;
}

.send-btn {
  margin-left: 10px;
  padding: 10px 20px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover {
  background: #3076c9;
}
</style>