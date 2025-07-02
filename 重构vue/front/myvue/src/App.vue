<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>  
export default {
  name: 'App',
  created() {
    // 🔥 这里是关键！页面加载时恢复登录状态
    this.$store.dispatch('user/restoreLoginStatus');
    console.log('应用启动，正在恢复登录状态...');
  }
}

</script>


<style>

</style>
