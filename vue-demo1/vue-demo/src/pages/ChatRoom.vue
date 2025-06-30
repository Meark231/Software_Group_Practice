<template>
  <div class="chat-container">
    <h2>欢迎，{{ username }}！</h2>

    <div class="messages" ref="messageBox">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <strong>{{ msg.from }}:</strong> {{ msg.text }}
      </div>
    </div>

    <div class="input-box">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="请输入消息"
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
import socket from '@/socket';

export default {
  name: 'ChatRoom',
  data() {
    return {
      username: '',
      newMessage: '',
      messages: []
    };
  },
  mounted() {
    // 从 localStorage 中获取用户名
    this.username = localStorage.getItem('username') || '匿名用户';

    // 通知后端：我上线了
    socket.emit('login', this.username);

    // 接收消息
    socket.on('receiveMessage', (msg) => {
      this.messages.push(msg);
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    });
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return;

      const msg = {
        from: this.username,
        text: this.newMessage
      };

      // 发给服务器
      socket.emit('sendMessage', msg);

      //自己发的消息，就让它等广播回来时统一处理，不再提前显示一次。
      //不然会出现自己发的消息显示两次的情况。
      
      //this.messages.push(msg);  
      
      this.newMessage = '';

      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
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
