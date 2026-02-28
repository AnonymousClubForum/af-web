<template>
  <div class="post-list-container">
    <div class="page-header">
      <div class="page-title">
        {{ (sectionId === 0 || !!sectionId) ? `帖子 - ${SECTION_DICT[sectionId]?.name}` : '全部帖子' }}
      </div>
      <div class="header-action">
        <el-input
            v-model="searchKeyword"
            clearable
            placeholder="搜索帖子标题/内容..."
            size="default"
            style="width: 300px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" type="primary" @click="handleSearch"/>
          </template>
        </el-input>
      </div>
    </div>
    <el-card v-if="sectionId === 0 || !!sectionId" class="post-card">
      <div class="section-desc">{{ SECTION_DICT[sectionId]?.desc }}</div>
    </el-card>
    <el-divider/>

    <!-- 帖子列表 卡片布局 -->
    <div v-loading="loading" class="post-card-list">
      <!-- 无数据占位 -->
      <div v-if="postList.length === 0" class="empty-tip">
        <el-empty description="暂无帖子，快来发布第一个帖子吧～"/>
      </div>

      <!-- 帖子卡片项 -->
      <el-card v-for="post in postList" :key="post.id" class="post-card" shadow="hover">
        <div class="post-main">
          <div class="post-title" @click="viewPost(post.id)">
            <el-tag v-if="post.isTop" type="danger">置顶</el-tag>
            {{ post.title }}
          </div>
          <UserMeta :avatar-id="post.avatarId"
                    :avatar-size="36"
                    :ctime="post.ctime"
                    :user-id="post.userId"
                    :username="post.username"
          />
        </div>
        <!-- 操作按钮 -->
        <div v-if="userStore.user?.id === post.userId" class="post-action">
          <el-button :icon="EditPen" type="primary" @click="editPost(post.id)">编辑</el-button>
          <el-button :icon="Delete" type="danger" @click="deletePost(post.id)">删除</el-button>
        </div>
      </el-card>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :default-page-size="20"
            :pager-count="5"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-button :icon="Plus" class="floating-create-btn" type="primary" @click="goToCreatePost"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete, EditPen, Plus, Search} from '@element-plus/icons-vue'
import {deletePost as deletePostApi, getPostPage} from '../api'
import type {Post} from "../types";
import {useUserStore} from '../stores'
import UserMeta from "./UserMeta.vue";
import {SECTION_DICT} from "../constants/section.ts";

const props = defineProps<{
  userId?: string
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const sectionId = computed(() => route.params.sectionId ? Number(route.params.sectionId) : undefined)
const loading = ref(false)
const postList = ref<Post[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取帖子列表
const fetchPostList = async () => {
  loading.value = true
  try {
    const res = await getPostPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      userId: props.userId,
      searchContent: searchKeyword.value || undefined,
      sectionId: sectionId.value
    })
    if (res.data) {
      postList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索帖子
const handleSearch = () => {
  currentPage.value = 1
  fetchPostList()
}

// 查看帖子详情
const viewPost = (id: string) => {
  router.push(`/post/${id}`)
}

// 创建帖子
const goToCreatePost = () => {
  router.push('/post/create')
}

// 编辑帖子
const editPost = (postId: string) => {
  router.push(`/post/edit/${postId}`)
}

// 删除帖子
const deletePost = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deletePostApi(id)
    ElMessage.success('删除成功')
    await fetchPostList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除帖子失败:', error)
    }
  }
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchPostList()
}

watch(
    () => route.params.sectionId,
    () => {
      currentPage.value = 1
      fetchPostList()
    },
    {immediate: true}
)

onMounted(() => {
  fetchPostList()
})
</script>

<style scoped>
/* 全局容器样式 */
.post-list-container {
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 标题+搜索+发布按钮 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
}

.section-desc {
  font-size: 18px;
  margin-bottom: 30px;
  transition: all 0.2s ease;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 右下角浮动发布按钮样式 */
.floating-create-btn {
  position: fixed; /* 固定定位，随页面滚动 */
  right: 40px; /* 距离右侧40px */
  bottom: 40px; /* 距离底部40px */
  width: 45px; /* 圆形按钮宽度 */
  height: 45px; /* 圆形按钮高度 */
  border-radius: 50%; /* 圆形样式 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* 确保在最上层 */
  font-size: 14px;
  border: none;
  transition: all 0.2s ease; /* 过渡动画 */
}

/* 悬浮效果 */
.floating-create-btn:hover {
  transform: scale(1.05); /* 轻微放大 */
}

/* 帖子列表容器 */
.post-card-list {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  justify-content: center; /* 垂直居中 */
  gap: 16px;
}

.post-card {
  position: relative; /* 为操作按钮绝对定位提供参考 */
  padding-right: 120px; /* 为右上角操作按钮预留空间，避免内容被遮挡 */
  transition: all 0.2s ease;
}

/* 帖子主体内容 */
.post-main {
  cursor: pointer;
  padding: 8px 0;
}

.post-title {
  font-size: 18px;
  margin-bottom: 12px;
}

.post-title:hover {
  text-decoration: underline;
  color: var(--el-color-primary); /* 贴合主题色，提升交互体验 */
}

/* 操作按钮区域：绝对定位到右上角 */
.post-action {
  position: absolute;
  top: 16px; /* 距离卡片顶部 */
  right: 16px; /* 距离卡片右侧 */
  display: flex;
  gap: 8px; /* 按钮之间的间距 */
}

/* 无数据提示 */
.empty-tip {
  text-align: center;
  padding: 60px 0;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

/* 响应式适配 小屏幕自动适配 */
@media (max-width: 768px) {
  .post-card {
    padding-right: 0; /* 小屏幕取消右侧内边距 */
    padding-bottom: 30px; /* 为操作按钮预留底部空间 */
  }

  .post-action {
    position: relative; /* 小屏幕改为相对定位 */
    top: 0;
    right: 0;
    justify-content: flex-end; /* 右对齐 */
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>