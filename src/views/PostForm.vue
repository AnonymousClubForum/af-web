<template>
  <div class="post-form-container">
    <el-card>
      <template #header>
        <el-header class="card-header">
          <h2>{{ isEdit ? '编辑帖子' : '发布帖子' }}</h2>
          <el-button @click="goBack">返回</el-button>
        </el-header>
      </template>

      <el-form ref="postFormRef" :model="postForm" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input
              v-model="postForm.title"
              clearable
              maxlength="100"
              placeholder="请输入帖子标题"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <MdEditor
              v-model="postForm.content"
              :theme="isDark ? 'dark' : 'light'"
              height="500px"
              placeholder="请输入帖子内容"
              style="background-color: rgba(0,0,0,0)"
              @onUploadImg="handleUploadImage"
          />
        </el-form-item>

        <div style="align-items: end; width: 100%">
          <el-button :loading="loading" type="primary" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '发布' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useDark} from "@vueuse/core";
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import {createPost, getPost, updatePost} from '../api'
import type {SavePostRequest} from '../types'
import {uploadFile} from "../api/file.ts";
import {MdEditor} from "md-editor-v3";

const router = useRouter()
const route = useRoute()
const isDark = useDark()

const postFormRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

const postForm = reactive<SavePostRequest>({
  id: route.params.id ? String(route.params.id) : undefined,
  title: '',
  content: ''
})

const rules: FormRules = {
  title: [
    {required: true, message: '请输入帖子标题', trigger: 'blur'},
    {min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur'}
  ]
}

// 处理图片上传（核心功能）
const handleUploadImage = async (files: Array<File>, callback: (urls: string[] | {
  url: string;
  alt: string;
  title: string
}[]) => void) => {
  const res = await Promise.all(
      files.map((file) => {
        return new Promise((rev, rej) => {
          uploadFile(file)
              .then((res) => rev(res))
              .catch((error) => rej(error));
        })
      })
  )
  callback(res.map((item: any) => `/storage/file/download?id=${item.data.data}`))
};

// 加载帖子详情（编辑模式）
const loadPostDetail = async () => {
  const postId = route.params.id ? String(route.params.id) : undefined
  if (!postId) return

  loading.value = true
  try {
    const res = await getPost(postId)
    if (res.data) {
      postForm.title = res.data.title
      postForm.content = res.data.content
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
          await router.push(`/posts`)
        }
      } else {
        const res = await createPost(postForm)
        if (res.data) {
          ElMessage.success('发布成功')
          await router.push(`/posts`)
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
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
