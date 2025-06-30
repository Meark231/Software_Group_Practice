<template>
  <div class="slider" ref="slider">
    <!-- 图片容器组 -->
    <div class="slider-group" ref="sliderGroup">
      <!-- 插槽，父组件传入内容 -->
      <slot></slot>
    </div>

    <!-- 底部圆点指示器 -->
    <div class="dots">
      <span
        class="dot"
        v-for="(item, index) in dots"
        :key="index"
        :class="{ active: currentPageIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script>
import { addClass } from "common/js/dom"; // 用于添加 CSS 类名
import BScroll from "better-scroll"; // 核心轮播依赖

export default {
  name: "Slider",

  props: {
    // 是否循环滚动
    loop: {
      type: Boolean,
      default: true,
    },
    // 是否自动播放
    autoPlay: {
      type: Boolean,
      default: true,
    },
    // 自动播放间隔
    interval: {
      type: Number,
      default: 4000,
    },
  },

  data() {
    return {
      dots: [], // 指示器数量
      currentPageIndex: 0, // 当前所在页索引
      timer: null, // 自动播放计时器
      children: [], // 子节点缓存
    };
  },

  mounted() {
    this.$nextTick(() => {
      this._setSliderWidth(); // 设置每一项宽度
      this._initDots(); // 初始化指示器
      this._initSlider(); // 初始化滚动插件

      if (this.autoPlay) {
        this._play(); // 开始自动播放
      }
    });

    // 响应式调整轮播容器宽度
    this._resizeHandler = () => {
      if (!this.slider) return;
      this._setSliderWidth(true);
      this.slider.refresh();
    };
    window.addEventListener("resize", this._resizeHandler);
  },

  beforeDestroy() {
    // 清除定时器和监听器，避免内存泄漏
    clearTimeout(this.timer);
    window.removeEventListener("resize", this._resizeHandler);
    this.slider && this.slider.destroy();
  },

  methods: {
    // 设置每个 slide 宽度
    _setSliderWidth(isResize = false) {
      this.children = this.$refs.sliderGroup.children;
      const sliderWidth = this.$refs.slider.clientWidth;
      let width = 0;

      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];
        addClass(child, "slider-item");
        child.style.width = sliderWidth + "px";
        width += sliderWidth;
      }

      // 如果开启 loop 且不是 resize，再加两页用于循环首尾
      if (this.loop && !isResize) {
        width += 2 * sliderWidth;
      }

      this.$refs.sliderGroup.style.width = width + "px";
    },

    // 初始化轮播插件
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400,
        },
        bounce: false,
        stopPropagation: true,
      });

      // 滚动结束后，更新当前页 & 继续播放
      this.slider.on("scrollEnd", () => {
        this.currentPageIndex = this.slider.getCurrentPage().pageX;

        if (this.autoPlay) {
          this._play(); // 继续自动播放
        }
      });

      // 手动滑动时，暂停自动播放
      this.slider.on("beforeScrollStart", () => {
        if (this.autoPlay) {
          clearTimeout(this.timer);
        }
      });
    },

    // 初始化指示点数量
    _initDots() {
      // 如果 loop 开启，真实子项需 -2（因为首尾被克隆了）
      const realLen = this.loop
        ? this.children.length - 2
        : this.children.length;
      this.dots = Array(realLen).fill(null);
    },

    // 启动自动播放
    _play() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.slider && this.slider.next();
      }, this.interval);
    },
  },
};
</script>
