<template>
  <div class="layout-container">
    <el-menu
        :default-active="activeMenu"
        class="layout-menu"
        mode="horizontal"
        router
    >
      <div class="menu-brand">
        <router-link to="/">
          <el-link :underline="false">
            <el-image
                src="/banner.png"
                alt="Anonymous Forum"
                style="width: auto; height: auto"
            />
          </el-link>
        </router-link>
      </div>
      <div class="menu-items">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/posts">帖子列表</el-menu-item>
        <el-menu-item v-if="userStore.isLoggedIn" index="/post/create">
          发布帖子
        </el-menu-item>
        <template v-if="!userStore.isLoggedIn">
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
        </template>
        <template v-else>
          <el-menu-item index="/profile">
            <el-avatar v-if="userStore.user?.avatarId" :src="userAvatarUrl ? userAvatarUrl : '/defaultAvatar.png'"
                       :size="24"/>
            <span>{{ userStore.user?.username }}</span>
          </el-menu-item>
        </template>
      </div>
    </el-menu>

    <div class="layout-main">
      <router-view/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {useUserStore} from '../stores'
import {loadImage} from "../utils/loadImage.ts";

const route = useRoute()
const userStore = useUserStore()
const userAvatarUrl = ref('')

const activeMenu = computed(() => route.path)

const loadAvatar = async () => {
  if (userStore.user) {
    if (userStore.user.avatarId) {
      userAvatarUrl.value = await loadImage(userStore.user.avatarId)
    }
  }
}

// 页面加载时获取用户头像
onMounted(() => {
  loadAvatar()
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-menu {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .menu-brand {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #409eff;
  }

  .menu-items {
    display: flex;
    align-items: center;
  }
}

.layout-main {
  flex: 1;
  background-color: #f5f7fa;
}
</style>
