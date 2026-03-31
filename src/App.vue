<template>
  <div class="layout-container">
    <div class="layout-header">
      <el-menu
          :default-active="activeMenu"
          :ellipsis="isEllipsis"
          mode="horizontal"
          router
      >
        <el-menu-item index="banner" route="/">
          <img
              alt="Anonymous Forum"
              src="/banner.png"
          />
        </el-menu-item>
        <el-menu-item index="/">首页</el-menu-item>
        <template v-if="!userStore.isLoggedIn">
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
        </template>
        <template v-else>
          <el-menu-item index="/notice">通知</el-menu-item>
          <el-sub-menu index="posts">
            <template #title>分区</template>
            <el-menu-item index="" @click="goToPostList(undefined)">全部</el-menu-item>
            <el-menu-item v-for="section in SECTION_DICT" :key="section.id" index="" @click="goToPostList(section.id)">
              {{ section.name }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item :index="`/profile/${userStore.user?.id}`">
            <AvatarItem :id="userStore.user?.avatarId" :size="24"/>
            <span>{{ userStore.user?.username ? userStore.user.username : '' }}</span>
          </el-menu-item>
        </template>
        <el-menu-item index="" @click="toggleTheme">切换主题</el-menu-item>
      </el-menu>
    </div>

    <div class="layout-main">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useDark} from '@vueuse/core'
import {useSectionStore, useUserStore} from './stores'
import AvatarItem from "./components/AvatarItem.vue";
import {SECTION_DICT} from "./constants/section.ts";

const route = useRoute()
const router = useRouter()
const isDark = useDark()
const userStore = useUserStore()
const sectionStore = useSectionStore()
const activeMenu = computed(() => route.path)
const isEllipsis = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const handleResize = () => {
  const windowWidth = window.innerWidth;
  isEllipsis.value = windowWidth < 768;
}

const goToPostList = (sectionId?: number) => {
  sectionStore.id = sectionId
  router.push('/posts')
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化状态
  userStore.loadFromServer()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

/* 全局禁止文本选中 */
.el-button, .el-empty, .el-menu, .el-menu-item, .el-tag {
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  user-select: none; /* 标准 */
}
</style>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  z-index: 1000;
  box-shadow: 0 2px 8px var(--el-border-color);
}

.layout-main {
  flex: 1;
}

.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>
