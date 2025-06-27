<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav>
      <ul>
        <li><router-link to="/login">登录</router-link></li>
        <li><router-link to="/register">注册</router-link></li>
      </ul>
    </nav>

    <!-- 渲染匹配到的页面 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
/* 样式自定义 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #ffffff;
  margin-top: 60px;
}

nav {
  background-color: #333;
  padding: 10px;
  position: sticky;
  top: 0;
}

nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

nav ul li {
  display: inline;
  margin-right: 15px;
}

nav ul li a {
  color: white;
  text-decoration: none;
  font-size: 18px;
}

nav ul li a:hover {
  text-decoration: underline;
}
.router-link{
  color:white;
}
</style>


