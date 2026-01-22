<template>
  <div class="post-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <el-button
              v-if="userStore.user?.username === post?.username"
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
            <el-avatar :src="getImageUrl(post.avatarId)" :size="40"/>
            <div class="author-details">
              <div class="author-name">{{ post.username }}</div>
              <div class="post-time">{{ post.ctime }}</div>
            </div>
          </div>
        </div>

        <el-divider/>

        <div class="post-body">
          <v-md-preview :text="post.content"/>
        </div>
      </div>
    </el-card>
    <el-divider/>
    <CommentList v-if="post" :postId="post.id"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ArrowLeft} from '@element-plus/icons-vue'
import {getPost} from '../api'
import type {Post} from '../types'
import {useUserStore} from '../stores'
import CommentList from "../components/CommentList.vue";
import {getImageUrl} from "../utils/loadImage.ts";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const post = ref<Post | null>(null)

// 加载帖子详情
const loadPostDetail = async () => {
  const postId = String(route.params.id)
  if (!postId) {
    router.replace('/')
    return
  }

  loading.value = true
  try {
    const res = await getPost(postId)
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
  }

  .post-body {
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    padding: 10px 0;
  }
}
</style>