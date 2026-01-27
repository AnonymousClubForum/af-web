<template>
  <div class="user-profile-container">
    <div class="profile-wrapper">
      <el-card
          v-loading="loading"
          border
          class="user-info-card"
          loading-text="正在加载用户信息..."
          radius="12px"
          shadow="hover"
      >
        <!-- 用户头像区域 -->
        <div class="avatar-wrapper">
          <AvatarItem :id="user.avatarId" :size="120" class="user-avatar"/>
        </div>

        <!-- 用户基本信息区域 -->
        <div class="user-meta">
          <el-space direction="vertical">
            <!-- 用户名 + 本人标签 -->
            <h2 class="username">
              {{ user.username || '用户已注销' }}
              <el-tag
                  v-if="user.id === userStore.user?.id"
                  size="small"
                  type="info"
              >
                我自己
              </el-tag>
            </h2>
          </el-space>

          <!-- 分割线 -->
          <el-divider content-position="center">基本信息</el-divider>

          <!-- 用户信息描述列表 -->
          <el-descriptions
              :column="1"
              bordered
              class="user-desc"
              size="small"
          >
            <el-descriptions-item label="性别">
              <el-icon :size="16" class="gender-icon">
                <Male v-if="user.gender === '男'"/>
                <Female v-if="user.gender === '女'"/>
                <UserFilled v-if="user.gender !== '男' && user.gender !== '女'"/>
              </el-icon>
              {{ user.gender || '未设置' }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 仅本人可见的操作按钮组 -->
          <div v-if="userStore.user?.id === user.id" class="user-actions">
            <el-space>
              <el-button
                  icon="User"
                  round
                  size="small"
                  type="primary"
                  @click="goToEditProfile"
              >
                编辑资料
              </el-button>
            </el-space>
          </div>
        </div>
      </el-card>

      <PostList :user-id="userId"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {getUser} from '../api'
import type {User} from '../types'
import {useUserStore} from '../stores'
import PostList from "../components/PostList.vue"
import {Female, Male, UserFilled} from '@element-plus/icons-vue'
import AvatarItem from "../components/AvatarItem.vue";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const user = ref<User>({
  id: '',
  username: '',
  gender: '',
  avatarId: ''
})
const userId = computed(() => route.params.id ? String(route.params.id) : undefined)

// 初始化用户数据
const getData = async () => {
  loading.value = true
  try {
    const userRes = await getUser(userId.value)
    if (userRes.code === 200) {
      user.value = userRes.data
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error('获取用户信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 编辑个人资料
const goToEditProfile = () => {
  router.push('/profile/edit')
}

watch(() => route.params.id, // 监听的目标：路由参数中的id
    (newId, oldId) => {
      // 避免初始加载时重复触发（newId和oldId都为undefined时）
      if (newId !== oldId) {
        console.log('用户ID变化，重新加载数据：', newId)
        getData() // 重新获取用户信息
      }
    },
    {
      immediate: false, // 不立即执行（初始加载由onMounted处理）
      deep: true // 深度监听（确保嵌套对象变化能被检测到）
    }
)

onMounted(() => {
  getData()
})
</script>

<style scoped>
/* 全局容器样式 */
.user-profile-container {
  min-height: 100vh;
  padding: 20px 15px;
}

/* 内容容器：限制最大宽度并居中 */
.profile-wrapper {
  max-width: 985px;
  margin: 0 auto;
}

/* 用户信息卡片 */
.user-info-card {
  height: fit-content;
  padding: 24px 16px;
  transition: all 0.3s ease; /* 过渡动画 */

  :hover {
    box-shadow: 0 8px 24px var(--el-box-shadow);
  }
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

/* 头像样式：增加边框和hover缩放 */
.user-avatar {
  border: 4px solid var(--el-border-color);
  box-shadow: 0 2px 8px var(--el-box-shadow);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-meta {
  padding: 0 8px;
}

.username {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.user-desc {
  margin: 16px 0;
}

.gender-icon {
  margin-right: 4px;
}

.user-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>