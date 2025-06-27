import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Perhome from '@/pages/Perhome.vue'

Vue.use(VueRouter)

const routes = [
  {
    path : '/',
    name : 'Perhome',
    component: Perhome
  },
  {
    path : '/login',
    name : 'Login',
    component: Login
  },
  {
    path : '/register',
    name : 'Register',
    component: Register
  },
  {
  path: '/chat',
  name: 'ChatRoom',
  component: () => import('@/pages/ChatRoom.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
