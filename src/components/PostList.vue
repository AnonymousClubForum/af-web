<template>
  <div class="post-list-container">
    <div class="page-header">
      <h2 class="page-title">帖子列表</h2>
      <div class="header-action">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索帖子标题/内容..."
            style="width: 300px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            size="default"
        >
          <template #append>
            <el-button type="primary" :icon="Search" @click="handleSearch"/>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 帖子列表 卡片布局（核心改造点） -->
    <div class="post-card-list" v-loading="loading">
      <!-- 无数据占位 -->
      <div class="empty-tip" v-if="postList.length === 0 && !loading">
        <el-empty description="暂无帖子，快来发布第一个帖子吧～"/>
      </div>

      <!-- 帖子卡片项 -->
      <div class="post-card" v-for="post in postList" :key="post.id">
        <div class="post-main">
          <div class="post-title">
            <el-link type="primary" @click="viewPost(post.id)" class="title-link">
              {{ post.title }}
            </el-link>
          </div>
          <UserMeta :user-id="post.userId"
                    :username="post.username"
                    :ctime="post.ctime"
                    :avatar-url="downloadUrl+post.avatarId"
                    :avatar-size="36"/>
        </div>
        <!-- 操作按钮 -->
        <div class="post-action">
          <el-button v-if="userStore.user?.id === post.userId" type="primary"
                     link size="small" @click="editPost(post.id)">编辑
          </el-button>
          <el-button v-if="userStore.user?.id === post.userId" type="danger"
                     link size="small" @click="deletePost(post.id)">删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页组件 位置不变 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-button type="primary" @click="goToCreatePost" class="floating-create-btn" :icon="Plus"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus, Search} from '@element-plus/icons-vue'
import {deletePost as deletePostApi, getPostPage} from '../api'
import type {SimplePost} from '../types'
import {useUserStore} from '../stores'
import UserMeta from "./UserMeta.vue";
import {downloadUrl} from "../constants";

const props = defineProps<{
  userId?: string
}>()

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const postList = ref<SimplePost[]>([])
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
      searchContent: searchKeyword.value || undefined
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

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchPostList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchPostList()
}

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
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
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
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4); /* 阴影提升层次感 */
  z-index: 999; /* 确保在最上层 */
  font-size: 14px;
  border: none;
  transition: all 0.2s ease; /* 过渡动画 */
}

/* 悬浮效果 */
.floating-create-btn:hover {
  transform: scale(1.05); /* 轻微放大 */
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5); /* 加深阴影 */
}

/* 帖子列表容器 */
.post-card-list {
  display: grid;
  gap: 16px;
  margin-bottom: 30px;
}

/* 核心：帖子卡片样式 重点美化 */
.post-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease-in-out;
  cursor: default;
}

/* 悬浮动效 提升质感 */
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: #dcdfe6;
}

/* 帖子主体内容 */
.post-main {
  flex: 1;
}

.post-title {
  margin-bottom: 12px;
}

.title-link {
  font-size: 18px;
  font-weight: 500;
  color: #1f2329;
  text-decoration: none;
}

.title-link:hover {
  color: #409eff;
}

/* 操作按钮区域 */
.post-action {
  margin-left: 16px;
}

/* 无数据提示 */
.empty-tip {
  text-align: center;
  padding: 60px 0;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* 响应式适配 小屏幕自动适配 */
@media (max-width: 768px) {
  .post-list-container {
    padding: 10px 16px;
  }

  .post-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-action {
    margin-left: 0;
    margin-top: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>