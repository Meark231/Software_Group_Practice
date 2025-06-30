<template>
  <!-- 外层容器，ref 供 JS 操作使用 -->
  <div ref="wrapper" class="image">
    <!-- 如果 data 有图片数组才渲染 -->
    <div v-if="data.length" class="wrapper" :class="classname">
      <!-- 遍历图片数组 -->
      <div
        class="flex-img"
        ref="fleximg"
        :key="index"
        v-for="(img, index) in data"
      >
        <!-- 每张图片展示，绑定点击事件 -->
        <img
          class="item"
          ref="item"
          :src="img"
          @click="showimg(data, index)"
          alt="图片加载中"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "ImageGrid",

  props: {
    // 接收图片数组
    data: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    // 根据图片数量动态分配布局样式类
    classname() {
      return {
        one: this.data.length === 1,
        four: this.data.length === 4,
        nine: this.data.length !== 1 && this.data.length !== 4,
      };
    },
  },

  mounted() {
    // 在 DOM 完全加载后初始化图片
    this.$nextTick(() => {
      this.initimg();

      // 添加窗口大小变化监听事件，刷新路由
      // ❗️建议移除这段代码或优化（见后文说明）
      window.addEventListener("resize", this.handleResize);
    });
  },

  beforeDestroy() {
    // 清除 resize 监听器，防止内存泄露
    window.removeEventListener("resize", this.handleResize);
  },

  watch: {
    // 当图片数据变化时重新初始化尺寸
    data() {
      this.initimg();
    },
  },

  methods: {
    // 将当前图集传给 vuex 并跳转查看页面
    showimg(data, index) {
      this.set_imgdata({ data }); // 将图片数组存入 vuex
      this.$router.push({ path: "/showimg", query: { index } });
    },

    // 初始化图片尺寸样式（适配裁剪）
    initimg() {
      this.$nextTick(() => {
        // 若只有一张图，不执行裁剪
        if (this.data.length === 1) return;

        // 遍历所有图片 DOM 进行裁剪适配
        this.$refs.item.forEach((item, index) => {
          const container = this.$refs.fleximg[index];
          const width = item.clientWidth;
          const height = item.clientHeight;

          // 设置容器为正方形
          container.style.width = `${width}px`;
          container.style.height = `${width}px`;

          if (width > height) {
            // 图片宽 > 高，设置为等宽高居中
            item.style.height = `${width}px`;
            item.style.width = "auto";
          } else {
            // 图片高 > 宽，垂直居中
            item.style.top = "50%";
            item.style.left = "0";
            item.style.transform = "translateY(-50%)";
            item.style.position = "relative";
          }
        });
      });
    },

    // 监听窗口尺寸变化刷新页面（建议谨慎使用）
    handleResize() {
      // 不推荐使用 go(0)，可以优化为重新触发布局逻辑
      this.$router.replace({ path: "/home" });
    },

    // 将 vuex mutation 映射进来
    ...mapMutations(["set_imgdata"]),
  },
};
</script>

<style scoped lang="less">
.image {
  .one {
    text-align: center;

    .flex-img {
      margin: 0 auto;
      padding: 1px;
      width: 80%;

      img {
        width: 100%;
      }
    }
  }

  .nine {
    display: flex;
    flex-wrap: wrap;

    .flex-img {
      margin: 2px;
      width: 30%;
      overflow: hidden;

      img {
        width: 100%;
        position: relative;
        display: block;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }

  .four {
    display: flex;
    flex-wrap: wrap;

    .flex-img {
      margin: 2px;
      width: 48%;
      overflow: hidden;
      box-sizing: content-box;

      img {
        width: 100%;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
