<template>
  <div class="post-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <el-button
              v-if="userStore.user?.id === post?.userId"
              type="primary"
              @click="editPost"
          >
            编辑
          </el-button>
        </div>
      </template>

      <div v-if="post" class="post-content">
        <h1 class="post-title">{{ post.title }}</h1>

        <div class="post-meta">
          <div class="author-info">
            <el-avatar v-if="post.authorAvatar" :src="post.authorAvatar" :size="40"/>
            <div class="author-details">
              <div class="author-name">{{ post.author }}</div>
              <div class="post-time">{{ post.createTime }}</div>
            </div>
          </div>
          <div class="view-count">
            <el-icon>
              <View/>
            </el-icon>
            <span>{{ post.viewCount }} 次浏览</span>
          </div>
        </div>

        <el-divider/>

        <div class="post-body">
          {{ post.content }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ArrowLeft, View} from '@element-plus/icons-vue'
import {getPostDetail} from '../api'
import type {Post} from '../types'
import {useUserStore} from '../stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const post = ref<Post | null>(null)

// 加载帖子详情
const loadPostDetail = async () => {
  const postId = Number(route.params.id)
  if (!postId) {
    router.replace('/')
    return
  }

  loading.value = true
  try {
    const res = await getPostDetail(postId)
    if (res.data) {
      post.value = res.data
    }
  } catch (error) {
    console.error('加载帖子详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 编辑帖子
const editPost = () => {
  if (post.value) {
    router.push(`/post/edit/${post.value.id}`)
  }
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-content {
  .post-title {
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 20px 0;
    color: #333;
  }

  .post-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-details {
        .author-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .post-time {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .view-count {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #999;
      font-size: 14px;
    }
  }

  .post-body {
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
