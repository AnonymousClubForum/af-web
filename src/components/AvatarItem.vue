<template>
  <el-avatar :src="props.id ? `/storage/file/download?id=${props.id}` : '/defaultAvatar.png'"
             :size="props.size" fallback="/defaultAvatar.png"/>
</template>

<script setup lang="ts">
// 组件接收的 props
const props = defineProps<{
  id?: string
  size?: number
}>()
</script>

<style scoped>
</style>