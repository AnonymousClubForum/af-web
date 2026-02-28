<template>
  <div class="post-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <el-button
              v-if="userStore.user?.username === post?.username"
              type="primary"
              @click="editPost"
          >
            编辑
          </el-button>
        </div>
      </template>

      <div v-if="post" class="post-content">
        <h1 class="post-title">{{ post.title }}</h1>
        <UserMeta :avatar-id="post.avatarId"
                  :avatar-size="40"
                  :ctime="post.ctime"
                  :user-id="post.userId"
                  :username="post.username"/>
        <el-divider/>
        <div class="post-body">
          <MdPreview :modelValue="post.content"
                     :theme="isDark ? 'dark' : 'light'"
                     style="background-color: rgba(0,0,0,0)"
          />
        </div>
      </div>

      <template #footer>
        <div class="post-footer">
          <el-button :icon="ChatRound" @click="showReplyBox(undefined)">回复</el-button>
        </div>
      </template>

    </el-card>
    <el-divider/>

    <el-card v-loading="loadingComment">
      <template #header>
        <div class="card-header">
          <h1>评论</h1>
          <div v-if="commentList.length">
            <el-button :type="onlyShowPo ? 'primary' : 'default'" @click="toggleOnlyShowPo">只看楼主</el-button>
            <el-button @click="toggleTimeOrder">{{ isDesc ? '切换正序排序' : '切换倒序排序' }}</el-button>
          </div>
        </div>
      </template>

      <!-- 评论列表 -->
      <div v-if="commentList.length" class="comment-list">
        <div v-for="comment in commentList" :key="comment.id" class="comment-item">
          <UserMeta :avatar-id="comment.avatarId"
                    :avatar-size="32"
                    :ctime="comment.ctime"
                    :is-po="comment.userId === post?.userId"
                    :user-id="comment.userId"
                    :username="comment.username"/>
          <div v-if="!!comment.parentComment" class="parent-comment-item">
            <UserMeta v-if="comment.parentComment.userId"
                      :ctime="comment.parentComment.ctime"
                      :user-id="comment.parentComment.userId"
                      :username="comment.parentComment.username"/>
            <div class="parent-comment-content">{{ comment.parentComment.content }}</div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-footer">
            <el-button :icon="ChatRound" @click="showReplyBox(comment.id)">回复</el-button>
            <el-button v-if="comment.userId === userStore.user?.id"
                       :icon="Delete" type="danger" @click="handleDeleteComment(comment.id)">删除
            </el-button>
          </div>
          <el-divider/>
        </div>
        <!-- 分页区域 -->
        <div class="pagination">
          <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <div v-else class="empty-tip">✨ 暂无评论，来说点什么吧～</div>
    </el-card>

    <ReplyDialog
        v-model="showReplyDialog"
        :commentId="replyCommentId"
        :postId="post?.id"
        @success="loadCommentList"
    />
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useDark} from "@vueuse/core";
import {ArrowLeft, ChatRound, Delete} from '@element-plus/icons-vue'
import {deleteComment, getCommentPage, getPost} from '../api'
import type {Comment, Post} from '../types'
import {useUserStore} from '../stores'
import UserMeta from "../components/UserMeta.vue";
import {MdPreview} from "md-editor-v3";
import {ElMessage, ElMessageBox} from "element-plus";
import ReplyDialog from "../components/ReplyDialog.vue";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isDark = useDark()

const loading = ref(false)
const post = ref<Post | null>(null)

// 页面参数
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 评论列表
const loadingComment = ref(false)
const commentList = ref<Comment[]>([])
const onlyShowPo = ref(false)
const isDesc = ref(false)

// 回复框
const showReplyDialog = ref(false)
const replyCommentId = ref<string>()

// 加载帖子详情
const loadPostDetail = async () => {
  const postId = String(route.params.id)
  if (!postId) {
    await router.replace('/')
    return
  }

  loading.value = true
  try {
    const res = await getPost(postId)
    if (res.data) {
      post.value = res.data
    }
    await loadCommentList()
  } catch (error) {
    console.error('加载帖子详情失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载评论列表
 */
const loadCommentList = async () => {
  if (!post.value) return
  loadingComment.value = true
  try {
    const res = await getCommentPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      postId: post.value.id,
      userId: onlyShowPo.value ? post.value.userId : undefined,
      isDesc: isDesc.value
    })
    if (res.code === 200) {
      commentList.value = res.data.records
      total.value = res.data.total
    } else {
      console.error('加载评论失败')
    }
  } catch (error) {
    console.error('加载评论异常:', error)
  } finally {
    loadingComment.value = false
  }
}

/**
 * 切换只看楼主
 */
const toggleOnlyShowPo = () => {
  onlyShowPo.value = !onlyShowPo.value
  pageNum.value = 1
  loadCommentList()
}

/**
 * 切换按时间正序/倒序排列
 */
const toggleTimeOrder = () => {
  isDesc.value = !isDesc.value
  pageNum.value = 1
  loadCommentList()
}

/**
 * 删除评论
 * @param id 评论ID
 */
const handleDeleteComment = async (id: string) => {
  await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await deleteComment(id)
      if (res.code === 200) {
        ElMessage.success('删除成功！')
        // 重新加载当前页评论
        await loadCommentList()
      } else {
        ElMessage.error('删除失败')
      }
    } catch (error) {
      console.error('删除评论异常:', error)
      ElMessage.error('删除评论出错，请重试！')
    }
  })
}

/**
 * 显示回复框
 * @param parentId 父评论ID
 */
const showReplyBox = (parentId: string | undefined) => {
  console.log("打开回复框: " + parentId)
  replyCommentId.value = parentId
  showReplyDialog.value = true
}

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  loadCommentList()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  pageNum.value = page
  loadCommentList()
}

// 返回
const goBack = () => {
  router.back()
}

// 编辑帖子
const editPost = () => {
  if (post.value) {
    router.push(`/post/edit/${post.value.id}`)
  }
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-content {
  .post-title {
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 20px 0;
    color: var(--el-text-color-primary);
  }

  .post-body {
    font-size: 16px;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    padding: 10px 0;

    :deep(img) {
      max-width: 100%;
      max-height: 500px;
      border-radius: 4px;
      margin: 10px 0;
    }
  }
}

.post-footer {
  text-align: right;
}

/* 评论列表样式 */
.comment-list {
  margin-top: 8px;
}

.comment-item {
  transition: all 0.2s ease;
}

.parent-comment-item {
  border-left: 4px solid var(--el-border-color);
  margin: 15px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.comment-content {
  line-height: 1.7;
  margin: 12px;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.parent-comment-content {
  line-height: 1.5;
  margin: 6px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-footer {
  text-align: right;
}

/* 空状态样式 */
.empty-tip {
  text-align: center;
  padding: 40px 0;
  font-size: 15px;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
}
</style>