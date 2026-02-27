<template>
  <!-- 弹出式回复框核心容器 -->
  <ElDialog
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="title"
      width="500px"
      @close="handleCancel"
  >
    <!-- 回复内容输入框 -->
    <ElInput
        v-model="replyContent"
        :maxlength="10000"
        :rows="6"
        class="reply-input"
        placeholder="请输入回复内容（最多10000字符）..."
        show-word-limit
        type="textarea"
    />

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton :disabled="!replyContent.trim()" type="primary" @click="handleConfirm">
          发送回复
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue';
import {createComment} from "../api";
import {ElMessage} from "element-plus";

// 定义组件 Props 类型
interface Props {
  // 控制弹窗显隐（支持 v-model 双向绑定）
  modelValue: boolean;
  // 回复所属帖子
  postId: string | undefined;
  // 回复的评论
  commentId: string | undefined;
}

// 接收 Props
const props = defineProps<Props>();

// 定义组件触发的事件
const emit = defineEmits<{
  // 更新显隐状态（v-model 双向绑定）
  'update:modelValue': [value: boolean];
  // 发布成功
  success: [];
}>();

// 弹窗显隐状态（内部维护）
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 回复内容与标题绑定
const title = ref<string>('');
const replyContent = ref<string>('');

watch(
    () => props.commentId,
    (newVal) => {
      if (!!newVal) {
        title.value = '回复评论';
      } else {
        title.value = '回复帖子';
      }
    },
    {immediate: true}
);

// 处理确认回复
const handleConfirm = async () => {
  const content = replyContent.value.trim();
  if (!content) return;

  // 触发确认事件，传递回复内容
  try {
    const res = await createComment({
      postId: props.postId,
      parentId: props.commentId,
      content: content
    })
    if (res.code === 200) {
      ElMessage.success('回复成功!')
      // 清空输入框并关闭弹窗
      replyContent.value = ''
      dialogVisible.value = false
      // 触发发布成功操作
      emit('success')
    } else {
      ElMessage.error('回复失败')
    }
  } catch (error) {
    console.error('回复异常:', error)
    ElMessage.error('回复出错，请重试！')
  }
};

// 处理取消回复
const handleCancel = () => {
  console.log('用户取消回复')
  // 清空输入框并关闭弹窗
  replyContent.value = ''
  dialogVisible.value = false
};
</script>

<style scoped>
.reply-input {
  margin-bottom: 10px;
}

.dialog-footer {
  text-align: right;
}
</style>