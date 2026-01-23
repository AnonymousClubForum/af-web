<template>
  <div class="user-profile-container">
    <el-card class="user-info-card" shadow="hover" v-loading="loading">
      <!-- 用户头像 -->
      <div class="avatar-wrapper">
        <el-avatar :size="120" :src="user.avatarUrl"/>
      </div>

      <!-- 用户基本信息 -->
      <div class="user-meta">
        <h2 class="username">{{ user.username || '用户已注销' }}</h2>

        <el-descriptions :column="1" bordered class="user-desc">
          <el-descriptions-item label="性别">
            {{ user.gender || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布帖子数">
            <el-tag>{{ total || 0 }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 仅本人可见的操作按钮 -->
        <div class="user-actions" v-if="userStore.user?.id === user.id">
          <el-button type="primary" icon="User" size="small" @click="goToEditProfile">编辑资料</el-button>
        </div>
      </div>
    </el-card>

    <PostList :user-id="user.id"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getUser} from '../api'
import type {User} from '../types'
import {getImageUrl} from '../utils/image.ts'
import {useUserStore} from '../stores'
import PostList from "../components/PostList.vue";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const user = ref<User>({
  id: '',
  username: '',
  gender: '',
  avatarId: '',
  avatarUrl: ''
})
const total = ref(0)

// 初始化数据
const getData = async () => {
  loading.value = true
  try {
    // 获取用户基础信息
    const userRes = await getUser(String(route.params.id))
    if (userRes.code === 200) {
      user.value = userRes.data
      user.value.avatarUrl = getImageUrl(user.value.avatarId)
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
  } finally {
    loading.value = false
  }
}

// 编辑个人资料
const goToEditProfile = () => {
  router.push('/profile/edit')
}

onMounted(() => {
  getData()
})
</script>

<style scoped>
/* 全局容器样式 */
.user-profile-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 10px 0;
}

/* 左侧用户信息卡片 */
.user-info-card {
  height: fit-content;
  text-align: center;
  padding: 20px 0;
}

.avatar-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.user-meta {
  padding: 0 10px;
}

.username {
  font-size: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.user-desc {
  margin-bottom: 15px;
}

.user-actions {
  margin-top: 15px;
}
</style>