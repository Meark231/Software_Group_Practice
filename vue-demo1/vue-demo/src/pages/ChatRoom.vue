<template>
  <div class="chat-container">
    <h2>欢迎，{{ username }}！</h2>

    <!-- 聊天记录显示 -->
    <div class="messages" ref="messageBox">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <strong>{{ msg.from }}:</strong> {{ msg.text }}
      </div>
    </div>

    <!-- 输入框：用户输入对方的 UID -->
    <div class="input-box">
      <el-input
        v-model="targetUid"
        placeholder="请输入对方的 UID 开始私聊"
        style="width: 300px; margin-bottom: 10px;"
      ></el-input>
      <el-button type="primary" @click="joinPrivateChat">进入私聊</el-button>
    </div>

    <!-- 消息发送框 -->
    <div class="input-box">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="请输入消息"
      />
      <button @click="sendMessage">发送</button>
    </div>

    <el-button type="primary" @click="createGroupChat">创建群聊</el-button>

    <el-input
      v-model="targetRoomId"
      placeholder="请输入群聊ID加入群聊"
      style="width: 300px; margin-bottom: 10px;"
    ></el-input>
    <el-button type="primary" @click="joinGroupChat">加入群聊</el-button>

  </div>
</template>

<script>
import socket from '@/socket';

export default {
  name: 'ChatRoom',
  data() {
    return {
      username: '',          // 当前用户名
      uid: localStorage.getItem('uid'),  // 获取当前用户的 UID（通过登录时保存）
      targetUid: '',         // 目标用户的 UID
      targetRoomId: '',  // 确保加入群聊输入框绑定的值初始化
      newMessage: '',        // 新消息
      messages: [],          // 当前房间的消息
      currentRoomId: ''      // 当前房间的 roomId
    };
  },
  mounted() {
    // 从 localStorage 中获取用户名
    this.username = localStorage.getItem('username') || '匿名用户';

    // 通知后端：我上线了
    socket.emit('login', this.username);

    // 接收消息
    socket.on('receiveMessage', (msg) => {
      if (msg.roomId === this.currentRoomId) {
        this.messages.push(msg);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    });
  },
  methods: {
    // 加入私聊房间，根据 uid 生成 roomId
    joinPrivateChat() {
      if (!this.uid || !this.targetUid) return;

      // 构造 roomId（根据 uid 排序确保唯一性）
      const uidA = Number(this.uid);
      const uidB = Number(this.targetUid);
      const sorted = [uidA, uidB].sort((a, b) => a - b);  // 字典序排序
      this.currentRoomId = `room_${sorted[0]}_${sorted[1]}`;

      socket.emit('joinRoom', this.currentRoomId);  // 加入房间
      this.messages = [];  // 清空旧消息
      this.$message.success(`已进入私聊房间 ${this.currentRoomId}`);
    },

    // 发送消息
    sendMessage() {
      if (!this.newMessage.trim()) return;

      const msg = {
        roomId: this.currentRoomId,  // 当前群聊房间 id
        from: this.username,         // 当前用户的 username
        text: this.newMessage,       // 消息内容
        time: new Date()             // 时间戳
      };

      socket.emit('sendMessage', msg);  // 发送消息到群聊
      this.newMessage = '';  // 清空输入框

      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },


    async createGroupChat() {
      if (!this.username) return;

      // 请求后端创建群聊
      socket.emit('createGroupChat', this.username);

      socket.on('groupChatCreated', (data) => {
        this.currentRoomId = data.roomId;  // 获取新的群聊 ID
        this.$message.success(`群聊 ${data.roomId} 创建成功`);
        console.log(`群聊 ID: ${data.roomId} 创建成功`); // 添加控制台日志帮助调试
      });
    },

    joinGroupChat() {
      if (!this.targetRoomId) return;

      // 加入指定的群聊房间
      socket.emit('joinRoom', this.targetRoomId);
      this.currentRoomId = this.targetRoomId;
      this.messages = [];  // 清空消息

      this.$message.success(`已加入群聊房间 ${this.currentRoomId}`);
    },

    // 滚动到最底部
    scrollToBottom() {
      const box = this.$refs.messageBox;
      box.scrollTop = box.scrollHeight;
    }
  }
};
</script>

<style scoped>
.chat-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.messages {
  border: 1px solid #ccc;
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 8px;
}

.input-box {
  display: flex;
  gap: 10px;
}
input {
  flex: 1;
  padding: 6px;
  font-size: 16px;
}
button {
  padding: 6px 12px;
  font-size: 16px;
}
</style>


