<template>
  <el-avatar :size="props.size"
             :src="props.id ? `/storage/file/download?id=${props.id}` : '/defaultAvatar.png'"
             fallback="/defaultAvatar.png"/>
</template>

<script lang="ts" setup>
// 组件接收的 props
const props = defineProps<{
  id?: string
  size?: number
}>()
</script>

<style scoped>
</style>