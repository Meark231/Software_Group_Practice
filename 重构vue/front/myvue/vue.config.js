const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
  , lintOnSave: false // 关闭 ESLint 检查
  , devServer: {
    host: '0.0.0.0',
    port: 8081,
    allowedHosts: 'all', // 允许所有主机访问
    client:{
    webSocketURL: 'auto://0.0.0.0:0/ws'
   }
   } // 允许所有主机访问
})
