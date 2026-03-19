<template>
  <div class="notice-page">
    <!-- 通知类型选择按钮 -->
    <div class="notice-type-buttons">
      <el-button
          :disabled="true"
          :icon="Apple"
          type="default"
      >
        赞
      </el-button>
      <el-button
          :disabled="false"
          :icon="ChatRound"
          type="primary"
      >
        评论
      </el-button>
    </div>

    <!-- 通知列表区域 -->
    <div v-loading="loading" class="notice-list">
      <!-- 空数据提示 -->
      <el-empty v-if="noticeList.length === 0" description="暂无评论通知"></el-empty>

      <!-- 通知列表 -->
      <el-card
          v-for="notice in noticeList"
          v-else
          :key="notice.id"
          class="notice-card"
      >
        <UserMeta :avatar-id="notice.avatarId"
                  :avatar-size="24"
                  :ctime="notice.ctime"
                  :user-id="notice.userId"
                  :username="notice.username"/>
        <div class="notice-content">
          {{ notice.parentId ? '回复了你的评论: ' : '评论了你的帖子: ' }}
          <el-link type="default" @click="handleJump(notice)">
            {{ notice.parentId ? notice.parentContent : notice.postTitle }}
          </el-link>
        </div>
      </el-card>
    </div>

    <!-- 分页组件 -->
    <div v-if="noticeList.length > 0" class="pagination">
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="getCommentNoticeList"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {useUserStore} from '../stores'
import type {CommentNotice} from "../types";
import {getCommentNoticePage} from "../api";
import UserMeta from "../components/UserMeta.vue";
import {Apple, ChatRound} from "@element-plus/icons-vue";

const router = useRouter()
const userStore = useUserStore()

// 状态定义
const loading = ref(false) // 加载状态
const noticeList = ref<CommentNotice[]>([]) // 通知列表
const pageNum = ref(1) // 当前页码
const pageSize = ref(10) // 每页条数
const total = ref(0) // 总条数

// 获取评论通知列表
const getCommentNoticeList = async () => {
  // 校验用户ID
  if (!userStore.user?.id) {
    ElMessage.error('未获取到用户信息，请先登录')
    return
  }
  loading.value = true
  try {
    const res = await getCommentNoticePage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      userId: userStore.user.id
    })

    if (res.code === 200) {
      noticeList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error('获取通知列表失败: ' + res.msg)
    }
  } catch (error) {
    console.error('请求通知接口失败: ', error)
    ElMessage.error('网络异常，无法获取通知列表')
  } finally {
    loading.value = false
  }
}

// 处理跳转逻辑
const handleJump = (notice: CommentNotice) => {
  router.push(`/post/${notice.postId}`)
}

// 页面挂载时加载数据
onMounted(() => {
  getCommentNoticeList()
})
</script>

<style scoped>
.notice-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.notice-type-buttons {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.notice-list {
  min-height: 400px;
}

.notice-card {
  margin-bottom: 15px;
}

.notice-content {
  padding: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
</style>