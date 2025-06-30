<template>
  <div class="comment div-wrap">
    <!-- 顶部导航栏组件，标题根据是否是“回复”动态变化 -->
    <myheader :title="to ? '回复' : '评论'">
      <!-- 左插槽：返回按钮 -->
      <i class="iconfont icon-fanhui1 left" slot="left" @click="goback"></i>

      <!-- 右插槽：发送按钮 -->
      <span slot="right" class="right" @click="comment">发送</span>
    </myheader>

    <!-- 如果已登录，显示评论输入框 -->
    <div class="weui-cells weui-cells_form" v-if="userInfo._id">
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <!-- 输入框绑定 content，支持双向输入 -->
          <textarea
            class="weui-textarea"
            v-model="content"
            :placeholder="to ? '回复' + to : '评论...'"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 如果未登录，显示未登录提示组件 -->
    <unlogin v-else></unlogin>
  </div>
</template>

<script>
import { mapState } from "vuex";
import myheader from "components/myheader/my-header";
import unlogin from "../../components/unlogin/unlogin";
import { Toast } from "mint-ui";

export default {
  data() {
    return {
      // 被回复的用户（可能为空）
      to: this.$route.query.to || "",
      // 被评论的动态（pyq）的 id
      id: this.$route.query.id || "",
      // 发布该动态的人
      writer: this.$route.query.writer || "",
      // 当前输入的评论内容
      content: "",
    };
  },

  computed: {
    // 从 Vuex 获取当前登录用户信息
    ...mapState(["userInfo"]),
  },

  components: {
    myheader,
    unlogin,
  },

  methods: {
    // 返回上一页
    goback() {
      this.$router.go(-1);
    },

    // 提交评论
    comment() {
      // 如果评论内容为空，提示
      if (!this.content) {
        Toast("内容不能为空！");
        return;
      }

      // 发送评论请求
      this.axios
        .post("/comment", {
          writer: this.writer, // 被评论的动态作者
          from: this.userInfo.username, // 当前评论用户
          to: this.to, // 被回复的用户
          pyq: this.id, // 被评论的动态 ID
          content: this.content, // 评论内容
        })
        .then((rs) => {
          // 如果是自己对自己的动态回复自己，不需要通知 socket
          if (
            this.writer === this.userInfo.username &&
            this.to === this.userInfo.username
          ) {
            this.$router.go(-1);
            Toast(rs.data.msg);
            return;
          }

          // 以下逻辑是通知被评论/回复的人（通过 socket）
          if (this.to) {
            if (
              this.to === this.writer ||
              this.writer === this.userInfo.username
            ) {
              socket.emit("comment", this.to);
            } else {
              socket.emit("comment", this.writer);
              socket.emit("comment", this.to);
            }
          } else if (this.writer !== this.userInfo.username) {
            socket.emit("comment", this.writer);
          }

          // 评论成功后返回并提示
          this.$router.go(-1);
          Toast(rs.data.msg);
        })
        .catch((err) => {
          Toast("评论失败，请稍后再试");
          console.error(err);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.comment {
  //增加 padding 或设置背景，可在此添加样式
}
</style>
