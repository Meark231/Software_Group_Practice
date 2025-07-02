

import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Perhome from '@/pages/Perhome.vue'
import Home from '@/pages/Home.vue'
import Profile from '@/pages/Profile.vue'
import Singlechat from '@/pages/Singlechat.vue'


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
    path: '/home',
    name: Home,
    component: Home
  },
  {
    path: '/user/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/user/singlechat/',
    name: 'Singlechat',
    component: Singlechat,
  }
]

const router = new VueRouter({
  routes
})

export default router