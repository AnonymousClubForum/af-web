<template>
  <div class="comment-list-container">
    <!-- 发布一级评论区域 -->
    <div class="comment-post">
      <textarea
          v-model="commentContent"
          placeholder="请输入评论内容..."
          class="comment-input"
          :disabled="!props.postId"
      ></textarea>
      <button @click="handlePostComment(undefined)" class="post-btn" :disabled="!props.postId || !commentContent.trim()">
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
        <div class="reply-box" v-if="activeReplyId === comment.id">
          <textarea
              v-model="replyContent"
              placeholder="请输入回复内容..."
              class="reply-input"
          ></textarea>
          <div class="reply-actions">
            <button @click="handlePostComment(comment.id)" class="reply-post-btn" :disabled="!replyContent.trim()">
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
        </div>
      </div>
    </div>
    <div class="empty-tip" v-else>暂无评论</div>

    <!-- 分页区域 -->
    <div class="pagination">
      <button @click="handlePrevPage" :disabled="pageNum <= 1">上一页</button>
      <span>第 {{ pageNum }} 页</span>
      <button @click="handleNextPage">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref, watch } from 'vue'
import { createComment, deleteComment, getCommentPage } from '../api'
import type { Comment, QueryCommentPageRequest, SaveCommentRequest } from '../types'

// 扩展Comment类型，增加二级评论字段
interface CommentWithSub extends Comment {
  subComments?: Comment[]
}

// 从父组件接收props
const props = defineProps<{
  postId: string // 必传的帖子ID
}>()

// 页面参数
const pageNum: Ref<number> = ref(1)
const pageSize: Ref<number> = ref(10)
// 评论列表（包含二级评论）
const commentList: Ref<CommentWithSub[]> = ref([])
// 发布一级评论的内容
const commentContent: Ref<string> = ref('')
// 回复内容
const replyContent: Ref<string> = ref('')
// 当前激活的回复框ID（对应父评论ID）
const activeReplyId: Ref<string | undefined> = ref(undefined)

/**
 * 加载评论列表（包含二级评论）
 */
const loadCommentList = async () => {
  if (!props.postId) return

  try {
    // 1. 获取一级评论
    const firstLevelParams: QueryCommentPageRequest = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      postId: props.postId,
      parentId: undefined // 空表示查询一级评论
    }
    const firstLevelRes = await getCommentPage(firstLevelParams)

    if (firstLevelRes.code === 200) {
      const firstLevelComments: CommentWithSub[] = JSON.parse(firstLevelRes.data)

      // 2. 为每个一级评论查询二级评论
      for (const comment of firstLevelComments) {
        const subParams: QueryCommentPageRequest = {
          pageNum: 1,
          pageSize: 999, // 二级评论默认加载全部
          postId: props.postId,
          parentId: comment.id
        }
        const subRes = await getCommentPage(subParams)
        if (subRes.code === 200) {
          comment.subComments = JSON.parse(subRes.data)
        }
      }

      commentList.value = firstLevelComments
    } else {
      console.error('加载评论失败:', firstLevelRes.message)
    }
  } catch (error) {
    console.error('加载评论异常:', error)
  }
}

/**
 * 发布评论（支持一级/二级）
 * @param parentId 父评论ID（undefined表示一级评论）
 */
const handlePostComment = async (parentId?: string) => {
  const content = parentId ? replyContent.value.trim() : commentContent.value.trim()
  if (!content) {
    alert(parentId ? '请输入回复内容！' : '请输入评论内容！')
    return
  }

  try {
    const data: SaveCommentRequest = {
      postId: props.postId,
      parentId,
      content
    }
    const res = await createComment(data)
    if (res.code === 200) {
      alert(parentId ? '回复成功！' : '发布成功！')
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
      alert((parentId ? '回复' : '发布') + '失败：' + res.message)
    }
  } catch (error) {
    console.error((parentId ? '回复' : '发布') + '评论异常:', error)
    alert((parentId ? '回复' : '发布') + '评论出错，请重试！')
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
      alert('删除成功！')
      // 重新加载当前页评论
      loadCommentList()
    } else {
      alert('删除失败：' + res.message)
    }
  } catch (error) {
    console.error('删除评论异常:', error)
    alert('删除评论出错，请重试！')
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
    replyBox?.scrollIntoView({ behavior: 'smooth' })
  }, 0)
}

/**
 * 上一页
 */
const handlePrevPage = () => {
  pageNum.value--
  loadCommentList()
}

/**
 * 下一页
 */
const handleNextPage = () => {
  pageNum.value++
  loadCommentList()
}

// 监听postId变化，重新加载评论
watch(() => props.postId, () => {
  pageNum.value = 1 // 重置页码
  loadCommentList()
}, { immediate: true })

// 初始化加载评论
onMounted(() => {
  loadCommentList()
})
</script>

<style scoped>
.comment-list-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.comment-post {
  margin-bottom: 30px;
}

.comment-input, .reply-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  resize: none;
  margin-bottom: 10px;
}

.comment-input {
  height: 100px;
}

.reply-input {
  height: 60px;
}

.post-btn, .reply-post-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.post-btn:disabled, .reply-post-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.cancel-btn {
  margin-left: 10px;
  padding: 8px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: 600;
  color: #333;
}

.time {
  color: #999;
  font-size: 12px;
}

.comment-content {
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.reply-btn {
  color: #409eff;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn {
  color: #f56c6c;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
}

.reply-box {
  margin: 10px 0 20px 20px;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.sub-comment-list {
  margin-left: 20px;
  padding-left: 10px;
  border-left: 2px solid #f0f0f0;
}

.sub-comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
}

.sub-comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.sub-comment-content {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 5px;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination button {
  padding: 4px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  color: #999;
  cursor: not-allowed;
}
</style>