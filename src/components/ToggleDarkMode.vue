<template>
  <el-switch
      v-model="isDarkMode"
      active-text="深色模式"
      inactive-text="浅色模式"
      @change="toggleDarkMode"
  />
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

// 定义深色模式状态
const isDarkMode = ref(false)

// 切换深色/浅色模式
const toggleDarkMode = (value: boolean) => {
  // 更新 html 根元素的 dark 类
  document.documentElement.classList.toggle('dark', value)
  // 保存到本地存储，刷新页面不丢失
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

// 初始化：从本地存储读取用户选择，无则检测系统
onMounted(() => {
  // 优先读取本地存储的主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else { // 无本地存储则跟随系统
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  toggleDarkMode(isDarkMode.value)
})
</script>

<style scoped>
</style>