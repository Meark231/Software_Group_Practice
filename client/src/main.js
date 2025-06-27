import { createApp } from 'vue';  // 使用 Vue 3 的 createApp
import App from './App.vue';
import router from './router';  // 引入 router

const app = createApp(App);  // 创建 Vue 实例
app.use(router);  // 使用 Vue Router
app.mount('#app');  // 挂载 Vue 实例


