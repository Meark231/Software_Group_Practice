<template>
  <!-- 外部包裹容器，绑定 ref，用于 better-scroll 初始化 -->
  <div class="wrapper" ref="wrapper">
    <!-- 插槽，显示传入的内容 -->
    <slot></slot>
  </div>
</template>

<script>
// 引入 better-scroll 插件
import BScroll from "better-scroll";

export default {
  // 定义组件可接收的 props（属性）
  props: {
    // 滚动探测类型（0~3），默认为 1
    probeType: {
      type: Number,
      default: 1,
    },
    // 是否允许点击事件，默认为 true（否则 click 无效）
    click: {
      type: Boolean,
      default: true,
    },
    // 是否监听滚动事件
    listenScroll: {
      type: Boolean,
      default: false,
    },
    // 当 data 变化时会触发刷新
    data: {
      type: Array,
      default: null,
    },
    // 是否启用上拉功能（未在代码中实际使用）
    pullup: {
      type: Boolean,
      default: false,
    },
    // 是否在滚动前触发事件（未使用）
    beforeScroll: {
      type: Boolean,
      default: false,
    },
    // 刷新延时，watch 中使用
    refreshDelay: {
      type: Number,
      default: 20,
    },
    // 下拉刷新触发距离
    threshold: {
      type: Number,
      default: 10000000000, // 代表不开启
    },
    // 下拉刷新停顿距离
    stop: {
      type: Number,
      default: 45,
    },
    // 是否组件创建后自动滚动到底部
    toBottom: {
      type: Boolean,
      default: false,
    },
  },

  // 生命周期钩子，组件挂载后初始化 scroll
  mounted() {
    this.$nextTick(() => {
      this._initScroll();
    });
  },

  methods: {
    // 初始化 better-scroll 实例
    _initScroll() {
      if (!this.$refs.wrapper) return;

      // 创建 BScroll 实例
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click,
        observeDOM: true, // 自动监听 DOM 变化
        bounce: {
          top: true,
          bottom: true,
          left: true,
          right: true,
        },
        pullDownRefresh: {
          threshold: this.threshold,
          stop: this.stop,
        },
      });

      // 如果需要监听滚动事件，绑定监听
      if (this.listenScroll) {
        this.scroll.on("scroll", (pos) => {
          this.$emit("scrolling", pos.y); // 向父组件发送事件
        });
      }

      // 如果设置了 threshold < 极大值，说明启用了下拉刷新逻辑
      if (this.threshold < 10000000000) {
        let flag = false;

        // 绑定 scroll 事件，实现下拉刷新判定
        this.scroll.on("scroll", (pos) => {
          // 判断是否超过阈值
          if (pos.y > this.threshold) {
            flag = true;
          }

          // 到达停止位置，触发刷新事件
          if (flag && pos.y === this.stop) {
            this.$emit("change");
            this.$emit("refresh");
            flag = false;
          }
        });
      }
    },

    // 滚动到顶部（用于外部调用）
    toTop() {
      this.scroll.scrollTo(0, 0, 500); // 500ms 动画滚动到顶部
    },

    // 滚动到底部（带动画或无动画）
    _toBottom(immediate = false) {
      if (this.scroll) {
        const duration = immediate ? 0 : 500;
        this.scroll.scrollTo(0, this.scroll.maxScrollY, duration);
      }
    },

    // 禁用滚动（外部可调用）
    disable() {
      this.scroll && this.scroll.disable();
    },

    // 启用滚动
    enable() {
      this.scroll && this.scroll.enable();
    },

    // 刷新 scroll 实例
    refresh() {
      const y = this.scroll.y; // 保留原位置
      if (this.scroll) {
        this.scroll.refresh();
        // 若原位置是滚动中，重新定位
        if (y < 0) {
          this.scroll.scrollTo(0, y, 0);
        }
        // 如果设置自动滚动到底部
        if (this.toBottom) {
          this._toBottom();
        }
      }
    },
  },

  // 监听 data 数据变化，触发刷新（更新滚动区域）
  watch: {
    data() {
      this.$nextTick(() => {
        this.refresh();
      });
      // 兼容某些异步更新延迟的场景
      setTimeout(() => {
        this.refresh();
      }, 21);
    },
  },
};
</script>

<style lang="less" scoped>
/* 样式可以按需扩展，例如 wrapper 限制高度 */
</style>
