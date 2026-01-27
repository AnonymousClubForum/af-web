<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div class="welcome-section">
            <h1>欢迎来到Anonymous Forum</h1>
            <p>一个简单、快速的交流平台</p>
            <el-space>
              <el-button type="primary" size="large" @click="goToPostList">
                进入论坛
              </el-button>
              <el-button
                  v-if="!userStore.isLoggedIn"
                  size="large"
                  @click="goToLogin"
              >
                登录 / 注册
              </el-button>
              <el-button
                  v-if="userStore.isLoggedIn"
                  size="large"
                  @click="goToCreatePost"
              >
                发布帖子
              </el-button>
            </el-space>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useUserStore} from '../stores'

const router = useRouter()
const userStore = useUserStore()

const goToPostList = () => {
  router.push('/posts')
}

const goToLogin = () => {
  router.push('/login')
}

const goToCreatePost = () => {
  router.push('/post/create')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 60px 20px;

  h1 {
    font-size: 48px;
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
  }

  p {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    margin-bottom: 40px;
  }
}
</style>
