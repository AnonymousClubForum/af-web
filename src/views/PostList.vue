<template>
  <div class="post-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>帖子列表</h2>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索帖子..."
              style="width: 300px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch"/>
            </template>
          </el-input>
          <el-button type="primary" @click="goToCreatePost">发布帖子</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="postList" stripe style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="300">
          <template #default="{ row }">
            <el-link type="primary" @click="viewPost(row.id)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="150">
          <template #default="{ row }">
            <div class="author-info">
              <el-avatar
                  v-if="row.authorAvatar"
                  :src="row.authorAvatar"
                  :size="30"
                  style="margin-right: 8px"
              />
              <span>{{ row.author }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center"/>
        <el-table-column prop="createTime" label="发布时间" width="180"/>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="userStore.user?.id === row.userId"
                type="primary"
                link
                size="small"
                @click="editPost(row)"
            >
              编辑
            </el-button>
            <el-button
                v-if="userStore.user?.id === row.userId"
                type="danger"
                link
                size="small"
                @click="deletePost(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Search} from '@element-plus/icons-vue'
import {deletePost as deletePostApi, getPostList} from '../api'
import type {Post} from '../types'
import {useUserStore} from '../stores'

const router = useRouter()
const userStore = useUserStore()

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
    const res = await getPostList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined
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
const viewPost = (id: number) => {
  router.push(`/post/${id}`)
}

// 创建帖子
const goToCreatePost = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/post/create')
}

// 编辑帖子
const editPost = (post: Post) => {
  router.push(`/post/edit/${post.id}`)
}

// 删除帖子
const deletePost = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deletePostApi(id)
    ElMessage.success('删除成功')
    fetchPostList()
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
.post-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  h2 {
    margin: 0;
    flex: 1;
  }
}

.author-info {
  display: flex;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
