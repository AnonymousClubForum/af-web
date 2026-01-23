<template>
  <div class="author-info" @click="goToUserProfile">
    <el-avatar :src="props.avatarUrl" :size="props.avatarSize"/>
    <div class="author-details">
      <div class="author-name">{{ props.username }}</div>
      <div class="post-time">{{ props.ctime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter()

// 组件接收的 props
const props = defineProps<{
  userId: string
  username?: string
  ctime?: string
  avatarUrl?: string
  avatarSize: number
}>()

// 跳转至用户主页
const goToUserProfile = () => {
  router.push(`/profile/${props.userId}`)
}
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .author-details {
    .author-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .post-time {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>