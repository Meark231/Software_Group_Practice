<template>
  <!-- 加载组件容器 -->
  <div class="loading">
    <!-- 加载动画图片，设置宽高，并添加 alt 文本以增强无障碍性 -->
    <img
      width="24"
      height="24"
      src="./loading.gif"
      alt="加载中..."
      @error="onImageError"
    />

    <!-- 描述文字，通过 props.title 传入 -->
    <p class="desc">{{ title }}</p>

    <!-- 提供默认插槽支持，可用于显示更多内容 -->
    <slot></slot>
  </div>
</template>

<script>
// ES6模块导出
export default {
  name: "Loading", // 给组件命名，方便调试和递归调用等场景

  props: {
    // 接收 title 属性，用于显示加载提示文字
    title: {
      type: String, // 必须是字符串类型
      default: "正在载入...", // 默认提示文字
    },
  },

  methods: {
    // 当图片加载失败时执行的回调，提升容错性
    onImageError(e) {
      console.warn("加载动画图片丢失，使用占位文本代替");
      e.target.style.display = "none"; // 隐藏加载失败的图片
    },
  },
};
</script>

<style scoped lang="less">
/* 外层 loading 容器样式 */
.loading {
  width: 100%;
  text-align: center;
  padding: 20px 0;

  /* 让内容垂直居中可适用于更多场景 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 图片样式（可选） */
  img {
    margin-bottom: 8px;
  }

  /* 描述文字样式 */
  .desc {
    line-height: 20px;
    font-size: 14px;
    color: #666;
  }
}
</style>
