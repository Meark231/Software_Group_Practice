<template>
  <div class="bg-container":style="{ backgroundImage: 'url(/img/01.jpg)' }">
    <button class="center-btn" @click="goLogin">
      <span class="circle-arrow">
        <!-- 圆圈箭头 SVG 图形 -->
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#409EFF" stroke-width="2" fill="none"/>
          <polyline points="10,8 14,12 10,16" fill="none" stroke="#409EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      开始进入
    </button>
  </div>
</template>

<script>
export default {
  name: 'PerHome',
  data() {
    return {
      
    };
  },
  methods: {
    goLogin() {
      this.$router.push({ name: 'Login' });
    }
  }
};

</script>

<style scoped>
 .bg-container {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 36px;
  border-radius: 24px;
  border: none;
  background: rgba(255,255,255,0.35);;
  color: #409EFF;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 24px rgba(64,158,255,0.15);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.center-btn:hover {
  background: #409EFF;
  color: #fff;
}

.circle-arrow {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
</style>