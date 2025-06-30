<template>
  <!-- 外层容器，用于包裹提示内容 -->
  <div class="p-tip">
    <!-- 提示图片（例如一个空状态图） -->
    <img
      class="p-tipimg"
      src="../../common/image/p-tip.jpg"
      alt="登录提示图片"
    />

    <!-- 第一行提示文字 -->
    <div class="text">你还没有登录</div>

    <!-- 第二行提示文字，包含一个跳转链接 -->
    <div class="text">
      请先
      <!-- 跳转到登录页的路由链接，点击后进入 /login -->
      <router-link to="/login" style="color: blue">登录</router-link>
    </div>
  </div>
</template>

<script>
export default {
  // 这是一个纯展示型组件，不需要逻辑
};
</script>

<style lang="less" scoped>
/* 外层容器样式 */
.p-tip {
  margin: 20px 0 10px 0; // 上下间距，防止太挤

  /* 提示图片样式 */
  .p-tipimg {
    width: 100%; // 撑满父容器宽度
    padding-bottom: 20px; // 图片下方空隙
    object-fit: contain; // 可加：保持图像比例不变（优化）
  }

  /* 所有文字共用的样式类 */
  .text {
    color: grey;
    font-size: 16px;
    line-height: 25px;
    text-align: center; // 居中显示
  }
}
</style>
