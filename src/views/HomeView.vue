<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div class="welcome-section">
            <div class="welcome-title">欢迎来到Anonymous Forum</div>
            <div class="welcome-info">一个简单、快速的交流平台</div>
            <el-space>
              <el-button size="large" type="primary" @click="goToPostList">
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

<script lang="ts" setup>
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

  .welcome-title {
    font-size: 36px;
    margin-bottom: 20px;
  }

  .welcome-info {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    margin-bottom: 40px;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .welcome-info {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 30px;
  }
}
</style>
