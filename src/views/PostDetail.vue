<template>
  <div class="post-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
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
        <UserMeta :avatar-id="post.avatarId"
                  :avatar-size="40"
                  :ctime="post.ctime"
                  :user-id="post.userId"
                  :username="post.username"/>
        <el-divider/>
        <div class="post-body">
          <MdPreview :modelValue="post.content"
                     :theme="themeStore.isDark ? 'dark' : 'light'"
          />
        </div>
      </div>
    </el-card>
    <el-divider/>
    <CommentList v-if="post" :postId="post.id"/>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ArrowLeft} from '@element-plus/icons-vue'
import {getPost} from '../api'
import type {Post} from '../types'
import {useThemeStore, useUserStore} from '../stores'
import CommentList from "../components/CommentList.vue";
import UserMeta from "../components/UserMeta.vue";
import {MdPreview} from "md-editor-v3";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

const loading = ref(false)
const post = ref<Post | null>(null)

// 加载帖子详情
const loadPostDetail = async () => {
  const postId = String(route.params.id)
  if (!postId) {
    await router.replace('/')
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
    color: var(--el-text-color-primary);
  }

  .post-body {
    font-size: 16px;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    padding: 10px 0;

    :deep(img) {
      max-width: 100%;
      max-height: 500px;
      border-radius: 4px;
      margin: 10px 0;
    }
  }
}
</style>