<template>
  <div class="post-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>{{ isEdit ? '编辑帖子' : '发布帖子' }}</h2>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form :model="postForm" :rules="rules" ref="postFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input
              v-model="postForm.title"
              placeholder="请输入帖子标题"
              maxlength="100"
              show-word-limit
              clearable
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
              v-model="postForm.content"
              type="textarea"
              placeholder="请输入帖子内容"
              :rows="15"
              maxlength="5000"
              show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存修改' : '发布' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import {createPost, getPost, updatePost} from '../api'
import type {SavePostRequest} from '../types'

const router = useRouter()
const route = useRoute()

const postFormRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

const postForm = reactive<SavePostRequest>({
  title: '',
  content: ''
})

const rules: FormRules = {
  title: [
    {required: true, message: '请输入帖子标题', trigger: 'blur'},
    {min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur'}
  ],
  content: [
    {required: true, message: '请输入帖子内容', trigger: 'blur'},
    {min: 1, max: 10000, message: '内容长度在 1 到 10000 个字符', trigger: 'blur'}
  ]
}

// 加载帖子详情（编辑模式）
const loadPostDetail = async () => {
  const postId = String(route.params.id)
  if (!postId) return

  loading.value = true
  try {
    const res = await getPost(postId)
    if (res.data) {
      postForm.title = res.data.title
      postForm.content = res.data.content
      postForm.id = res.data.id
    }
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    ElMessage.error('加载帖子详情失败')
    goBack()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!postFormRef.value) return

  await postFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (isEdit.value) {
        const res = await updatePost(postForm)
        if (res.data) {
          ElMessage.success('修改成功')
          router.push(`/post/${res.data}`)
        }
      } else {
        const res = await createPost(postForm)
        if (res.data) {
          ElMessage.success('发布成功')
          router.push(`/post/${res.data}`)
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 判断是否是编辑模式
  if (route.params.id) {
    isEdit.value = true
    loadPostDetail()
  }
})
</script>

<style scoped>
.post-form-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
  }
}
</style>
