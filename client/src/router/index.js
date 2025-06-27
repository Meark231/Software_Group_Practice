import { createRouter, createWebHistory } from 'vue-router';  // 从 vue-router 导入 createRouter 和 createWebHistory
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'LoginPage', component: LoginPage },
  { path: '/register', name: 'RegisterPage', component: RegisterPage },
];

const router = createRouter({
  history: createWebHistory(),  // 使用 HTML5 History 模式
  routes,  // 配置路由
});

export default router;

