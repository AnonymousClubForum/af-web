<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <h1>评论</h1>
      </div>
    </template>

    <!-- 发布一级评论区域 -->
    <div class="comment-post">
      <el-input
          v-model="commentContent"
          :disabled="!props.postId"
          :rows="4"
          class="comment-input"
          placeholder="分享你的观点和看法..."
          type="textarea"
      ></el-input>
      <el-button
          :disabled="!props.postId || !commentContent.trim()"
          type="primary"
          @click="handlePostComment(undefined)"
      >
        发布评论
      </el-button>
    </div>

    <!-- 一级评论列表 -->
    <div v-if="commentList.length" class="comment-list">
      <div v-for="comment in commentList" :key="comment.id" class="comment-item">
        <UserMeta :avatar-id="comment.avatarId"
                  :avatar-size="32"
                  :ctime="comment.ctime"
                  :user-id="comment.userId"
                  :username="comment.username"/>
        <div class="comment-content">{{ comment.content }}</div>
        <div class="comment-actions">
          <el-button link size="small" type="primary" @click="showReplyBox(comment.id)">回复</el-button>
          <el-button v-if="comment.subComments?.length && openSubComment !== comment.id"
                     link size="small" type="default" @click="openSubComment = comment.id">展开评论
          </el-button>
          <el-button v-if="openSubComment === comment.id"
                     link size="small" type="default" @click="openSubComment = undefined">折叠评论
          </el-button>
          <el-button v-if="comment.userId === userStore.user?.id"
                     link size="small" type="danger" @click="handleDeleteComment(comment.id)">删除
          </el-button>
        </div>

        <!-- 回复框 -->
        <div v-if="activeReplyId === comment.id" :data-parent-id="comment.id" class="reply-box">
          <el-input
              v-model="replyContent"
              :rows="4"
              class="reply-input"
              placeholder="友善回复，文明交流哦～"
              type="textarea"
          ></el-input>
          <div class="reply-actions">
            <el-button
                :disabled="!replyContent.trim()"
                type="primary"
                @click="handlePostComment(comment.id)"
            >
              发布回复
            </el-button>
            <el-button type="default" @click="activeReplyId = undefined">取消</el-button>
          </div>
        </div>

        <!-- 二级评论列表 -->
        <el-card v-if="openSubComment === comment.id" class="sub-comment-list">
          <div v-for="subComment in comment.subComments" :key="subComment.id" class="sub-comment-item">
            <UserMeta :avatar-id="subComment.avatarId"
                      :avatar-size="32"
                      :ctime="subComment.ctime"
                      :user-id="subComment.userId"
                      :username="subComment.username"/>
            <div class="sub-comment-content">{{ subComment.content }}</div>
            <div v-if="subComment.userId === userStore.user?.id" class="sub-comment-actions">
              <el-button link size="small" type="danger" @click="handleDeleteComment(subComment.id)">删除</el-button>
            </div>
          </div>
          <div class="pagination">
            <el-pagination
                v-model:current-page="subPageNum"
                v-model:page-size="subPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="subTotal"
                layout="prev, pager, next"
                @size-change="handleSubSizeChange"
                @current-change="handleSubCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    <div v-else class="empty-tip">✨ 暂无评论，来说点什么吧～</div>

    <!-- 分页区域 -->
    <div class="pagination main-pagination">
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
  </el-card>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {createComment, deleteComment, getCommentPage} from '../api'
import type {Comment} from '../types'
import {ElMessage, ElMessageBox} from "element-plus";
import UserMeta from "./UserMeta.vue";
import {useUserStore} from "../stores";

// 从父组件接收props
const props = defineProps<{
  postId: string // 必传的帖子ID
}>()
const userStore = useUserStore()

// 页面参数
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const subPageNum = ref(1)
const subPageSize = ref(10)
const subTotal = ref(0)

const loading = ref(false)

// 评论列表（包含二级评论）
const commentList = ref<Comment[]>([])
// 发布一级评论的内容
const commentContent = ref('')
// 回复内容
const replyContent = ref('')
// 当前展开的二级评论ID（对应父评论ID）
const openSubComment = ref<string>()
// 当前激活的回复框ID（对应父评论ID）
const activeReplyId = ref<string>()

/**
 * 加载评论列表（包含二级评论）
 */
const loadCommentList = async () => {
  if (!props.postId) return
  loading.value = true
  try {
    // 1. 获取一级评论
    const res = await getCommentPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      postId: props.postId,
      parentId: undefined // 空表示查询一级评论
    })
    if (res.code === 200) {
      commentList.value = res.data.records
      total.value = res.data.total
      // 2. 为每个一级评论查询二级评论
      for (const comment of commentList.value) {
        const subRes = await getCommentPage({
          pageNum: subPageNum.value,
          pageSize: subPageSize.value,
          postId: props.postId,
          parentId: comment.id
        })
        if (subRes.code === 200) {
          comment.subComments = subRes.data.records
          subTotal.value = subRes.data.total
        } else {
          console.error("加载评论失败")
        }
      }
    } else {
      console.error('加载评论失败')
    }
  } catch (error) {
    console.error('加载评论异常:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 发布评论（支持一级/二级）
 * @param parentId 父评论ID（undefined表示一级评论）
 */
const handlePostComment = async (parentId?: string) => {
  const content = parentId ? replyContent.value.trim() : commentContent.value.trim()
  if (!content) {
    ElMessage.error(parentId ? '请输入回复内容！' : '请输入评论内容！')
    return
  }

  try {
    const res = await createComment({
      postId: props.postId,
      parentId,
      content
    })
    if (res.code === 200) {
      ElMessage.success(parentId ? '回复成功！' : '发布成功！')
      // 清空输入框
      if (parentId) {
        replyContent.value = ''
        activeReplyId.value = undefined
      } else {
        commentContent.value = ''
      }
      // 重新加载当前页评论
      await loadCommentList()
    } else {
      ElMessage.error((parentId ? '回复' : '发布') + '失败')
    }
  } catch (error) {
    console.error((parentId ? '回复' : '发布') + '评论异常:', error)
    ElMessage.error((parentId ? '回复' : '发布') + '评论出错，请重试！')
  }
}

/**
 * 删除评论（支持一级/二级）
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
const showReplyBox = (parentId: string) => {
  activeReplyId.value = parentId
  replyContent.value = ''
  setTimeout(() => {
    const replyBox = document.querySelector(`.reply-box[data-parent-id="${parentId}"]`)
    const input = replyBox?.querySelector('textarea') as HTMLTextAreaElement
    replyBox?.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    input?.focus(); // 自动聚焦输入框
  }, 0)
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

/**
 * 分页大小改变
 */
const handleSubSizeChange = (size: number) => {
  subPageSize.value = size
  subPageNum.value = 1
  loadCommentList()
}

/**
 * 当前页改变
 */
const handleSubCurrentChange = (page: number) => {
  subPageNum.value = page
  loadCommentList()
}

// 监听postId变化，重新加载评论
watch(() => props.postId, () => {
  pageNum.value = 1 // 重置页码
  loadCommentList()
}, {immediate: true})

// 初始化加载评论
onMounted(() => {
  loadCommentList()
})
</script>

<style scoped>
/* 发布评论区域 */
.comment-post {
  margin-bottom: 28px;
}

.comment-input, .reply-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  box-sizing: border-box;
  transition: all 0.25s ease;
  margin-bottom: 12px;
}

/* 一级评论列表样式 */
.comment-list {
  margin-top: 8px;
}

.comment-item {
  padding: 20px 0;
  transition: all 0.2s ease;
}

.comment-content {
  line-height: 1.7;
  margin-bottom: 14px;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 18px;
  margin-bottom: 8px;
}

/* 回复框样式 */
.reply-box {
  margin: 12px 0 20px 24px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
}

/* 二级评论样式 【重点美化，层级分明】 */
.sub-comment-list {
  margin-left: 16px;
  padding-left: 12px;
  margin-top: 8px;
}

.sub-comment-item {
  padding: 16px 0;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.sub-comment-content {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 6px;
  white-space: pre-wrap;
  word-break: break-word;
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
  gap: 8px;
}

.main-pagination {
  margin-top: 32px;
}
</style>