<template>
  <div class="moments-page">
    <!-- 🔥 下拉刷新容器 -->
    <div 
      @scroll="handleScroll" 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      ref="scrollContainer" 
      class="scroll-container"
    >
      <!-- 🔥 下拉刷新提示 -->
      <div v-if="pullRefresh.isPulling" class="pull-refresh-indicator">
        <span v-if="pullRefresh.canRefresh">松开刷新</span>
        <span v-else>下拉刷新</span>
      </div>
      
      <!-- 动态列表 -->
      <div class="moments-list">
        <div v-for="moment in moments" :key="moment._id" class="moment-card">
          <!-- 用户信息 -->
          <div class="moment-header">
            <img 
              :src="moment.author.avatar || defaultAvatar" 
              class="user-avatar" 
              @error="handleAvatarError"
            />
            <div class="user-info">
              <span class="username">{{ moment.author.username }}</span>
              <span class="timestamp">{{ formatTime(moment.timestamp) }}</span>
            </div>
          </div>
          
          <!-- 动态内容 -->
          <div class="moment-content">
            <!-- 文字内容 -->
            <p v-if="moment.content.text" class="text-content">{{ moment.content.text }}</p>
            
            <!-- 图片内容 -->
            <div v-if="moment.content.images && moment.content.images.length > 0" class="images-grid">
              <img 
                v-for="(image, index) in moment.content.images" 
                :key="index"
                :src="image" 
                class="moment-image"
                @click="previewImage(image, moment.content.images)"
                @error="handleImageError"
              />
            </div>
          </div> <!-- 🔥 添加：moment-content 闭合标签 -->
          
          <!-- 点赞列表 -->
          <div v-if="moment.likes && moment.likes.length > 0" class="likes-section">
            <span class="likes-icon">❤️</span>
            <span class="likes-text">
              {{ moment.likes.map(like => like.username).join('、') }}
            </span>
          </div>
          
          <!-- 操作区域 -->
          <div class="moment-actions">
            <button 
              @click="toggleLike(moment)" 
              class="like-btn"
              :class="{ liked: isLiked(moment) }"
            >
              <span class="heart-icon">{{ isLiked(moment) ? '❤️' : '🤍' }}</span>
              <span>{{ moment.likes ? moment.likes.length : 0 }}</span>
            </button>
            
            <button @click="showCommentInput(moment)" class="comment-btn">
              💬 {{ moment.comments ? moment.comments.length : 0 }}
            </button>
          </div>
          
          <!-- 评论区域 -->
          <div v-if="moment.comments && moment.comments.length > 0" class="comments-section">
            <div v-for="comment in moment.comments" :key="comment._id" class="comment-item">
              <span class="comment-user">{{ comment.username }}:</span>
              <span class="comment-content">{{ comment.content }}</span>
              <span class="comment-time">{{ formatTime(comment.timestamp) }}</span>
            </div>
          </div>
          
          <!-- 评论输入框 -->
          <div v-if="activeCommentMoment === moment._id" class="comment-input-section">
            <input 
              v-model="commentText"
              @keyup.enter="submitComment(moment)"
              placeholder="写评论..."
              class="comment-input"
              ref="commentInput"
            />
            <button @click="submitComment(moment)" class="comment-submit">发送</button>
            <button @click="hideCommentInput" class="comment-cancel">取消</button>
          </div>
        </div> <!-- 🔥 添加：moment-card 闭合标签 -->
        
        <!-- 空状态 -->
        <div v-if="moments.length === 0" class="empty-state">
          <p>还没有动态，快来发布第一条吧！</p>
        </div>
      </div>
    </div>
    
    <!-- 🔥 创建动态按钮 -->
    <div class="create-btn-container">
      <button @click="showCreateModal" class="create-btn">
        <span class="plus-icon">+</span>
      </button>
    </div>
    
    <!-- 🔥 创建动态模态框 -->
    <div v-if="showCreateForm" class="create-modal-overlay" @click="hideCreateModal">
      <div class="create-modal" @click.stop>
        <div class="modal-header">
          <h3>发布动态</h3>
          <button @click="hideCreateModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-content">
          <!-- 文字输入 -->
          <textarea 
            v-model="newPost.text" 
            placeholder="分享你的生活..."
            class="text-input"
            rows="4"
          ></textarea>
          
          <!-- 图片上传 -->
          <div class="image-upload-section">
            <div class="uploaded-images">
              <div v-for="(image, index) in newPost.imageFiles" :key="index" class="image-preview">
                <img :src="image.preview" class="preview-img" />
                <button @click="removeImage(index)" class="remove-img-btn">×</button>
              </div>
              
              <!-- 添加图片按钮 -->
              <div v-if="newPost.imageFiles.length < 9" class="add-image-btn" @click="selectImages">
                <span class="add-icon">+</span>
                <span class="add-text">添加图片</span>
              </div>
            </div>
            
            <input 
              ref="imageInput"
              type="file" 
              accept="image/*"
              multiple
              style="display: none"
              @change="handleImageSelect"
            />
            
            <p class="image-limit-text">最多可上传9张图片</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="hideCreateModal" class="cancel-btn">取消</button>
          <button 
            @click="publishMoment" 
            :disabled="!canPublish"
            class="publish-btn"
          >
            发布
          </button>
        </div>
      </div>
    </div>
    
    <!-- 🔥 图片预览模态框 -->
    <div v-if="showImagePreview" class="image-preview-modal" @click="closeImagePreview">
      <img :src="previewImageUrl" class="preview-image" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// 🔥 API基础地址3000
const API_BASE_URL = 'https://053d-2001-250-4001-5013-f440-7238-b924-c272.ngrok-free.app';

export default {
  name: 'Pyq',
  data() {
    return {
      moments: [],
      currentUser: null,
      defaultAvatar: `${API_BASE_URL}/public/img/default.png`,
      
      // 创建动态相关
      showCreateForm: false,
      newPost: {
        text: '',
        imageFiles: [] // 存储文件对象和预览URL
      },
      
      // 评论相关
      activeCommentMoment: null,
      commentText: '',
      
      // 图片预览
      showImagePreview: false,
      previewImageUrl: '',
      
      // 下拉刷新
      pullRefresh: {
        isPulling: false,
        canRefresh: false,
        startY: 0,
        currentY: 0
      },
      
      // 加载状态
      isLoading: false
    };
  },
  
  computed: {
    canPublish() {
      return this.newPost.text.trim() || this.newPost.imageFiles.length > 0;
    }
  },
  
  mounted() {
    console.log('🔥 朋友圈页面加载');
    this.initCurrentUser();
    this.loadMoments();
  },

  
  methods: {
    // 🔥 初始化当前用户
    initCurrentUser() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      this.currentUser = userInfo;
      console.log('🔥 当前用户:', this.currentUser);
    },
    
    // 🔥 创建带ngrok绕过的axios实例
    createAxios() {
      return axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
    },
    
    // 🔥 加载动态列表
    async loadMoments() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      console.log('🔥 开始加载动态列表');
      
      try {
        const api = this.createAxios();
        const res = await api.get('/api/moments/list');
        
        console.log('🔥 动态列表响应:', res.data);
        
        if (res.data.code === 0) {
          this.moments = res.data.data;
          this.$message.success(`加载了 ${this.moments.length} 条动态`);
        } else {
          this.$message.error('获取动态失败: ' + res.data.msg);
        }
      } catch (error) {
        console.error('🔥 获取动态失败:', error);
        this.$message.error('网络错误，请重试');
      } finally {
        this.isLoading = false;
      }
    },
    
    // 🔥 下拉刷新相关
    handleScroll() {
      const container = this.$refs.scrollContainer;
      if (container.scrollTop === 0 && !this.isLoading) {
        this.refreshMoments();
      }
    },
    
    handleTouchStart(e) {
      this.pullRefresh.startY = e.touches[0].clientY;
    },
    
    handleTouchMove(e) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - this.pullRefresh.startY;
      
      if (diff > 0 && this.$refs.scrollContainer.scrollTop === 0) {
        this.pullRefresh.isPulling = true;
        this.pullRefresh.canRefresh = diff > 80;
        e.preventDefault();
      }
    },
    
    handleTouchEnd() {
      if (this.pullRefresh.canRefresh && !this.isLoading) {
        this.refreshMoments();
      }
      
      this.pullRefresh.isPulling = false;
      this.pullRefresh.canRefresh = false;
    },
    
    // 🔥 刷新动态列表
    async refreshMoments() {
      console.log('🔥 刷新动态列表');
      await this.loadMoments();
    },
    
    // 🔥 显示创建动态模态框
    showCreateModal() {
      this.showCreateForm = true;
      this.newPost = { text: '', imageFiles: [] };
    },
    
    // 🔥 隐藏创建动态模态框
    hideCreateModal() {
      this.showCreateForm = false;
      this.newPost = { text: '', imageFiles: [] };
    },
    
    // 🔥 选择图片
    selectImages() {
      this.$refs.imageInput.click();
    },
    
    // 🔥 处理图片选择
    handleImageSelect(e) {
      const files = Array.from(e.target.files);
      const remainingSlots = 9 - this.newPost.imageFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      filesToAdd.forEach(file => {
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
          this.$message.error(`图片 ${file.name} 超过5MB，已跳过`);
          return;
        }
        
        // 创建预览URL
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newPost.imageFiles.push({
            file: file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });
      
      // 清空input
      e.target.value = '';
    },
    
    // 🔥 移除图片
    removeImage(index) {
      this.newPost.imageFiles.splice(index, 1);
    },
    
    // 🔥 发布动态
    async publishMoment() {
      if (!this.canPublish) {
        this.$message.error('请输入内容或选择图片');
        return;
      }
      
      if (!this.currentUser.username) {
        this.$message.error('请先登录');
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('username', this.currentUser.username);
        formData.append('text', this.newPost.text);
        
        // 添加图片文件
        this.newPost.imageFiles.forEach(item => {
          formData.append('images', item.file);
        });
        
        console.log('🔥 发布动态，用户名:', this.currentUser.username);
        console.log('🔥 文字内容:', this.newPost.text);
        console.log('🔥 图片数量:', this.newPost.imageFiles.length);
        
        const res = await axios.post(`${API_BASE_URL}/api/moments/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        console.log('🔥 发布响应:', res.data);
        
        if (res.data.code === 0) {
          this.$message.success('发布成功');
          this.hideCreateModal();
          this.refreshMoments(); // 刷新列表
        } else {
          this.$message.error('发布失败: ' + res.data.msg);
        }
      } catch (error) {
        console.error('🔥 发布动态失败:', error);
        this.$message.error('发布失败，请重试');
      }
    },
    
    // 🔥 点赞相关
    isLiked(moment) {
      if (!moment.likes || !this.currentUser.username) return false;
      return moment.likes.some(like => like.username === this.currentUser.username);
    },
    
    async toggleLike(moment) {
      if (!this.currentUser.username) {
        this.$message.error('请先登录');
        return;
      }
      
      try {
        const api = this.createAxios();
        const res = await api.post('/api/moments/like', {
          momentId: moment._id,
          username: this.currentUser.username
        });
        
        if (res.data.code === 0) {
          // 更新本地数据
          const index = this.moments.findIndex(m => m._id === moment._id);
          if (index !== -1) {
            this.moments[index].likes = res.data.data.likes;
          }
        } else {
          this.$message.error('操作失败: ' + res.data.msg);
        }
      } catch (error) {
        console.error('🔥 点赞操作失败:', error);
        this.$message.error('操作失败，请重试');
      }
    },
    
    // 🔥 评论相关
    showCommentInput(moment) {
      this.activeCommentMoment = moment._id;
      this.commentText = '';
      
      // 🔥 修正：正确处理ref数组
      this.$nextTick(() => {
        const commentInputs = this.$refs.commentInput;
        if (commentInputs) {
          if (Array.isArray(commentInputs)) {
            // 🔥 如果是数组，聚焦到最后一个（最新显示的那个）
            const lastInput = commentInputs[commentInputs.length - 1];
            if (lastInput) lastInput.focus();
          } else {
            // 🔥 如果只有一个，直接聚焦
            commentInputs.focus();
          }
        }
      });
    },
    
    hideCommentInput() {
      this.activeCommentMoment = null;
      this.commentText = '';
    },
    
    async submitComment(moment) {
      if (!this.commentText.trim()) {
        this.$message.error('请输入评论内容');
        return;
      }
      
      if (!this.currentUser.username) {
        this.$message.error('请先登录');
        return;
      }
      
      try {
        const api = this.createAxios();
        const res = await api.post('/api/moments/comment', {
          momentId: moment._id,
          username: this.currentUser.username,
          content: this.commentText.trim()
        });
        
        if (res.data.code === 0) {
          // 更新本地数据
          const index = this.moments.findIndex(m => m._id === moment._id);
          if (index !== -1) {
            this.moments[index].comments = res.data.data.comments;
          }
          
          this.hideCommentInput();
          this.$message.success('评论成功');
        } else {
          this.$message.error('评论失败: ' + res.data.msg);
        }
      } catch (error) {
        console.error('🔥 评论失败:', error);
        this.$message.error('评论失败，请重试');
      }
    },
    
    // 🔥 图片预览
    previewImage(imageUrl, allImages) {
      this.previewImageUrl = imageUrl;
      this.showImagePreview = true;
    },
    
    closeImagePreview() {
      this.showImagePreview = false;
      this.previewImageUrl = '';
    },
    
    // 🔥 图片加载错误处理
    handleImageError(e) {
      console.log('🔥 动态图片加载失败，隐藏图片');
      e.target.style.display = 'none'; // 隐藏加载失败的图片
    },

    handleAvatarError(e) {
      console.log('🔥 头像加载失败，使用默认头像');
      e.target.src = this.defaultAvatar;
    },
    
    // 🔥 时间格式化
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) { // 1分钟内
        return '刚刚';
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前';
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前';
      } else {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
      }
    }
  }
};
</script>

<style scoped>
.moments-page {
  height: 100vh;
  background: #f5f5f5;
  position: relative;
}

.scroll-container {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 80px;
}

.pull-refresh-indicator {
  text-align: center;
  padding: 10px;
  color: #666;
  font-size: 14px;
}

.moments-list {
  padding: 10px;
}

.moment-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.timestamp {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

.moment-content {
  margin-bottom: 10px;
}

.text-content {
  margin: 0 0 10px 0;
  line-height: 1.5;
  color: #333;
  font-size: 15px;
}

.images-grid {
  display: grid;
  gap: 5px;
  margin-top: 8px;
}

.images-grid:has(> .moment-image:nth-child(1):nth-last-child(1)) {
  grid-template-columns: 1fr;
}

.images-grid:has(> .moment-image:nth-child(2):nth-last-child(1)) {
  grid-template-columns: 1fr 1fr;
}

.images-grid:has(> .moment-image:nth-child(3):nth-last-child(1)) {
  grid-template-columns: 1fr 1fr 1fr;
}

.images-grid:has(> .moment-image:nth-child(4)) {
  grid-template-columns: 1fr 1fr 1fr;
}

.moment-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.likes-section {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 10px 0;
}

.likes-icon {
  margin-right: 5px;
}

.likes-text {
  font-size: 14px;
  color: #666;
}

.moment-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding-top: 8px;
  margin-top: 8px;
}

.like-btn, .comment-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.like-btn:hover, .comment-btn:hover {
  background: #f0f0f0;
}

.like-btn.liked {
  color: #ff4757;
}

.heart-icon {
  font-size: 16px;
}

.comments-section {
  background: #f8f8f8;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 8px;
}

.comment-item {
  margin-bottom: 5px;
  font-size: 14px;
  line-height: 1.4;
}

.comment-user {
  color: #409EFF;
  font-weight: bold;
}

.comment-content {
  color: #333;
  margin: 0 5px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-input-section {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}

.comment-submit, .comment-cancel {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.comment-submit {
  background: #409EFF;
  color: white;
}

.comment-cancel {
  background: #f5f5f5;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #999;
}

.create-btn-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.create-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #409EFF;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
}

.create-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.6);
}

.plus-icon {
  font-weight: bold;
}

.create-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.create-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-content {
  padding: 20px;
}

.text-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.image-upload-section {
  margin-top: 15px;
}

.uploaded-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-img-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  aspect-ratio: 1;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.add-image-btn:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.add-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.add-text {
  font-size: 12px;
}

.image-limit-text {
  color: #999;
  font-size: 12px;
  margin: 5px 0 0 0;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .publish-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.publish-btn {
  background: #409EFF;
  color: white;
}

.publish-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  cursor: pointer;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-modal {
    width: 95%;
    margin: 10px;
  }
  
  .uploaded-images {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .create-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>