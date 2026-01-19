<template>
  <div class="comment-list-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h1>评论</h1>
        </div>
      </template>

      <!-- 发布一级评论区域 -->
      <div class="comment-post">
        <textarea
            v-model="commentContent"
            placeholder="分享你的观点和看法..."
            class="comment-input"
            :disabled="!props.postId"
        ></textarea>
        <button
            @click="handlePostComment(undefined)"
            class="post-btn"
            :disabled="!props.postId || !commentContent.trim()"
        >
          发布评论
        </button>
      </div>

      <!-- 一级评论列表 -->
      <div class="comment-list" v-if="commentList.length">
        <div class="comment-item" v-for="comment in commentList" :key="comment.id">
          <div class="comment-header">
            <span class="username">{{ comment.username }}</span>
            <span class="time">{{ comment.ctime }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <button class="reply-btn" @click="showReplyBox(comment.id)">回复</button>
            <button class="delete-btn" @click="handleDeleteComment(comment.id)">删除</button>
          </div>

          <!-- 回复框 -->
          <div class="reply-box" v-if="activeReplyId === comment.id" :data-parent-id="comment.id">
            <textarea
                v-model="replyContent"
                placeholder="友善回复，文明交流哦～"
                class="reply-input"
            ></textarea>
            <div class="reply-actions">
              <button
                  @click="handlePostComment(comment.id)"
                  class="reply-post-btn"
                  :disabled="!replyContent.trim()"
              >
                发布回复
              </button>
              <button @click="activeReplyId = undefined" class="cancel-btn">取消</button>
            </div>
          </div>

          <!-- 二级评论列表 -->
          <div class="sub-comment-list" v-if="comment.subComments?.length">
            <div class="sub-comment-item" v-for="subComment in comment.subComments" :key="subComment.id">
              <div class="sub-comment-header">
                <span class="username">{{ subComment.username }}</span>
                <span class="time">{{ subComment.ctime }}</span>
              </div>
              <div class="sub-comment-content">{{ subComment.content }}</div>
              <div class="sub-comment-actions">
                <button class="delete-btn" @click="handleDeleteComment(subComment.id)">删除</button>
              </div>
            </div>
            <div class="pagination">
              <el-pagination
                  v-model:current-page="subPageNum"
                  v-model:page-size="subPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="subTotal"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleSubSizeChange"
                  @current-change="handleSubCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="empty-tip" v-else>✨ 暂无评论，来说点什么吧～</div>

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
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {createComment, deleteComment, getCommentPage} from '../api'
import type {Comment} from '../types'
import {ElMessage} from "element-plus";

// 从父组件接收props
const props = defineProps<{
  postId: string // 必传的帖子ID
}>()

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
          console.error("加载评论失败:", subRes.message)
        }
      }
    } else {
      console.error('加载评论失败:', res.message)
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
      loadCommentList()
    } else {
      ElMessage.error((parentId ? '回复' : '发布') + '失败：' + res.message)
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
  if (!confirm('确定要删除这条评论吗？')) {
    return
  }

  try {
    const res = await deleteComment(id)
    if (res.code === 200) {
      ElMessage.success('删除成功！')
      // 重新加载当前页评论
      loadCommentList()
    } else {
      ElMessage.error('删除失败：' + res.message)
    }
  } catch (error) {
    console.error('删除评论异常:', error)
    ElMessage.error('删除评论出错，请重试！')
  }
}

/**
 * 显示回复框
 * @param parentId 父评论ID
 */
const showReplyBox = (parentId: string) => {
  activeReplyId.value = parentId
  replyContent.value = ''
  // 滚动到回复框位置（可选）
  setTimeout(() => {
    const replyBox = document.querySelector(`.reply-box[data-parent-id="${parentId}"]`)
    replyBox?.scrollIntoView({behavior: 'smooth', block: 'nearest'})
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
/* 全局容器样式 */
.comment-list-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

/* 发布评论区域 */
.comment-post {
  margin-bottom: 28px;
}

.comment-input, .reply-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  box-sizing: border-box;
  transition: all 0.25s ease;
  background-color: #fff;
}

.comment-input {
  height: 110px;
  margin-bottom: 12px;
}

.reply-input {
  height: 70px;
  margin-bottom: 10px;
}

/* 输入框聚焦/禁用样式 */
.comment-input:focus, .reply-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.comment-input:disabled {
  background-color: #fafafa;
  color: #c9c9c9;
  cursor: not-allowed;
}

/* 按钮通用样式 */
.post-btn, .reply-post-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
  padding: 9px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.post-btn:hover, .reply-post-btn:hover {
  background-color: #3393e8;
}

.post-btn:disabled, .reply-post-btn:disabled {
  background-color: #b3d4fc;
  cursor: not-allowed;
}

.cancel-btn {
  margin-left: 12px;
  padding: 9px 20px;
  border: 1px solid #e8e8e8;
  background-color: #fff;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #d0d0d0;
  color: #333;
}

/* 一级评论列表样式 */
.comment-list {
  margin-top: 8px;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px solid #f5f7fa;
  transition: all 0.2s ease;
}

.comment-item:hover {
  background-color: #fbfdff;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.username {
  font-weight: 600;
  color: #1f2329;
  font-size: 15px;
}

.time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  color: #303133;
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

.reply-btn {
  color: #409eff;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.reply-btn:hover {
  color: #3393e8;
}

.delete-btn {
  color: #f56c6c;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #e65252;
}

/* 回复框样式 */
.reply-box {
  margin: 12px 0 20px 24px;
  padding: 16px;
  border: 1px solid #f0f4f9;
  border-radius: 10px;
  background-color: #fbfdff;
}

/* 二级评论样式 【重点美化，层级分明】 */
.sub-comment-list {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #e5edfa;
  margin-top: 8px;
}

.sub-comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.sub-comment-item:hover {
  background-color: #f9fcff;
}

.sub-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sub-comment-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 空状态样式 */
.empty-tip {
  text-align: center;
  color: #909399;
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

.pagination button:disabled {
  color: #999;
  cursor: not-allowed;
}
</style>