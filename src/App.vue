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
          <el-image
              alt="Anonymous Forum"
              src="/banner.png"
          />
        </router-link>
      </div>
      <div class="menu-items">
        <el-menu-item index="/">首页</el-menu-item>
        <template v-if="!userStore.isLoggedIn">
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
        </template>
        <template v-else>
          <el-sub-menu index="posts">
            <template #title>分区</template>
            <el-menu-item index="/posts">全部</el-menu-item>
            <el-menu-item v-for="section in SECTION_DICT" :key="section.id" :index="`/posts/${section.id}`">{{section.name}}</el-menu-item>
          </el-sub-menu>
          <el-menu-item :index="`/profile/${userStore.user?.id}`">
            <AvatarItem :id="userStore.user?.avatarId" :size="24"/>
            <span>{{ userStore.user?.username }}</span>
          </el-menu-item>
        </template>
        <el-menu-item>
          <el-switch v-model="isDark" active-action-icon="moon-night" inactive-action-icon="sunny"
                     active-text="深色模式"/>
        </el-menu-item>
      </div>
    </el-menu>

    <div class="layout-main">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {useDark} from '@vueuse/core'
import {useUserStore} from './stores'
import AvatarItem from "./components/AvatarItem.vue";
import {SECTION_DICT} from "./constants/section.ts";

const route = useRoute()
const isDark = useDark()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)

onMounted(() => {
  userStore.loadFromServer()
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
</style>

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
  box-shadow: 0 2px 8px var(--el-border-color);

  .menu-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
  }

  .menu-items {
    display: flex;
    align-items: center;
  }
}

.layout-main {
  flex: 1;
}
</style>
