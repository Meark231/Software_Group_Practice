<template>
  <div class="app-header">
    <!-- 左侧插槽，允许父组件自定义内容（如返回按钮） -->
    <slot name="left"></slot>

    <!-- 中间标题区域 -->
    <span class="title">
      <!-- 图标插槽，允许插入 icon，默认是空的 -->
      <slot name="icon"> </slot>
      {{ title }}
    </span>

    <!-- 右侧插槽，允许插入操作按钮等 -->
    <slot name="right"></slot>
  </div>
</template>

<script>
export default {
  // 使用对象方式定义 props，更清晰、可扩展
  props: {
    title: {
      type: String,
      default: "", // 提供默认值，防止未传时报错或显示 undefined
    },
  },
};
</script>

<style lang="less" scoped>
.app-header {
  z-index: 999; // 设置较高层级，确保头部组件在最上方
  background-color: #fafafa; // 浅灰背景
  position: fixed; // 固定在顶部
  top: 0;
  height: 50px;
  width: 100%;
  line-height: 50px; // 文字垂直居中
  box-shadow: 0 1px 2px gainsboro; // 底部阴影分隔线

  .left {
    float: left; // 左浮动，插槽元素插入此类
    padding-left: 13px;
    font-size: 26px;
  }

  .right {
    float: right; // 右浮动
    padding-right: 13px;
    font-size: 14px;
  }

  .title {
    font-size: 20px;
    font-weight: bold;
    position: absolute;
    left: 50%;
    transform: translateX(-50%); // 实现居中对齐

    .icon {
      display: inline-block;
      vertical-align: top;
      margin-top: 6px;
      width: 30px;
      height: 32px;
      margin-right: 9px;
      background: url("1.png"); // 图标背景图片
      background-size: 30px 32px; // 拉伸图标至合适大小
    }
  }
}
</style>
