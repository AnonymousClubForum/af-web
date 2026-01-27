<template>
  <div class="user-meta" @click="goToUserProfile">
    <AvatarItem :id="props.avatarId" :size="props.avatarSize"/>
    <div class="details">
      <div class="name">{{ props.username }}</div>
      <div class="time">{{ props.ctime }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useRouter} from "vue-router";
import AvatarItem from "./AvatarItem.vue";

const router = useRouter()

// 组件接收的 props
const props = defineProps<{
  userId: string
  username?: string
  ctime?: string
  avatarId?: string
  avatarSize: number
}>()

// 跳转至用户主页
const goToUserProfile = () => {
  router.push(`/profile/${props.userId}`)
}
</script>

<style scoped>
.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  .details {
    .name {
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.user-meta :hover .name {
  text-decoration: underline;
}
</style>