<template>
  <div class="comlist div-wrap">
    <!-- 顶部自定义头部组件，传入标题，并插入左侧图标按钮 -->
    <myheader :title="'评论列表'">
      <!-- 使用 slot 插槽插入返回图标按钮，点击返回 -->
      <template v-slot:left>
        <i class="iconfont icon-fanhui1 left" @click="goback"></i>
      </template>
    </myheader>

    <!-- 使用 scroll 滚动组件包裹评论列表 -->
    <scroll :data="com" class="scroll-wrap">
      <ul class="lists">
        <!-- 遍历评论数据列表 com，每一项为 item -->
        <li v-for="(item, index) in com" :key="index" class="list">
          <!-- 回复按钮，点击跳转到评论页 -->
          <div class="reply" @click="reply(item.pyqid, item.from, item.writer)">
            回复
          </div>

          <!-- 评论的上半部分：头像 + 用户名 + 时间 -->
          <div class="comheader">
            <div class="avater">
              <img :src="item.headerimg" />
            </div>
            <div class="header-right">
              <div class="username">{{ item.from }}</div>
              <!-- 使用过滤器格式化时间 -->
              <div class="time">{{ item.addTime | fomatTime }}</div>
            </div>
          </div>

          <!-- 评论内容 -->
          <div class="comcontent">
            {{ item.content }}
          </div>

          <!-- 评论的关联朋友圈部分 -->
          <div class="comfooter">
            <div class="avater">
              <img :src="item.footerimg" />
            </div>
            <div class="footer-right">
              <div class="username">{{ item.writer }}</div>
              <div class="pyq">{{ item.pyq }}</div>
            </div>
          </div>
        </li>
      </ul>
    </scroll>
  </div>
</template>

<script>
// 导入头部组件和滚动组件
import myheader from "../../components/myheader/my-header";
import scroll from "../../components/scroll/scroll";

// 导入 Vuex mapState 用于访问状态中的 userInfo
import { mapState } from "vuex";

export default {
  data() {
    return {
      // 评论数据数组
      com: [],
    };
  },
  computed: {
    // 映射 Vuex 中的 userInfo 到本地计算属性
    ...mapState(["userInfo"]),
  },
  methods: {
    // 返回上一页方法，跳转到 /news
    goback() {
      this.$router.push({ path: "/news" });
    },
    // 点击“回复”按钮后跳转到评论页面，携带参数
    reply(id, to, writer) {
      this.$router.push({
        path: "/comment",
        query: { id, to, writer },
      });
    },
    // 从后端获取当前用户的评论数据
    getCom() {
      // 判空防止未登录或 userInfo 异常
      if (!this.userInfo || !this.userInfo.username) {
        return;
      }

      this.axios
        .get("/comment/getcom", {
          params: {
            username: this.userInfo.username,
          },
        })
        .then((result) => {
          const { data } = result;
          if (!data.code) {
            // 反转评论顺序（最新在前）
            this.com = data.com ? data.com.reverse() : [];
          } else {
            // 异常反馈可加入提示
            console.warn("获取评论失败:", data.msg || "未知错误");
          }
        })
        .catch((err) => {
          // 网络或服务器错误处理
          console.error("评论获取失败:", err);
        });
    },
  },
  // 页面创建时获取评论数据
  created() {
    this.getCom();
  },
  // 注册组件
  components: {
    myheader,
    scroll,
  },
};
</script>

<style lang="less" scoped>
.comlist {
  .lists {
    .list {
      position: relative;
      background-color: white;
      margin: 2px 0;
      padding: 8px;

      .reply {
        position: absolute;
        right: 10px;
        top: 8px;
        color: #4e86ff;
        cursor: pointer;
      }

      .comheader {
        display: flex;

        .avater {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .header-right {
          display: flex;
          flex-direction: column;
          margin-left: 8px;

          .username {
            height: 25px;
            line-height: 25px;
            font-weight: bold;
          }

          .time {
            height: 15px;
            font-size: 14px;
            line-height: 15px;
            color: grey;
          }
        }
      }

      .comcontent {
        margin: 8px 0;
        font-size: 15px;
        line-height: 1.5;
      }

      .comfooter {
        width: 100%;
        background-color: #f8f8f8;
        display: flex;
        padding: 6px;
        border-radius: 4px;

        .avater {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .footer-right {
          display: flex;
          flex-direction: column;
          margin-left: 8px;
          overflow: hidden;
          text-overflow: ellipsis;

          .username {
            font-weight: bold;
            font-size: 14px;
          }

          .pyq {
            font-size: 14px;
            line-height: 15px;
            color: grey;
            max-height: 30px;
            word-break: break-word;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
