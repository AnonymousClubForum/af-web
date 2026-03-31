<template>
  <div class="post-form-container">
    <el-card v-loading="loading">
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
        <el-form-item label="分区" prop="sectionId">
          <el-select v-model="postForm.sectionId" placeholder="选择分区...">
            <el-option
                v-for="section in SECTION_DICT"
                :key="section.id"
                :label="section.name"
                :value="section.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
              v-model="postForm.content"
              :rows="10"
              maxlength="10000"
              placeholder="请输入帖子内容"
              show-word-limit
              type="textarea"
          />
          <el-upload
              :before-upload="beforeUploadImage"
              :on-error="onUploadError"
              :on-success="onUploadSuccess"
              :show-file-list="false"
              action="/storage/file/upload"
              class="img-upload-area"
          >
            <el-icon class="el-icon--upload">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text">
              点击上传配图
            </div>
            <template #tip>
              <div class="el-upload__tip">
                允许不超过10MB的 jpg/png/webp 文件
              </div>
            </template>
          </el-upload>

        </el-form-item>

        <div style="justify-self: right">
          <el-button :loading="submitting" type="primary" @click="handleSubmit">
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
import {ElMessage, type FormInstance, type FormRules, type UploadRawFile} from 'element-plus'
import {createPost, getPost, updatePost} from '../api'
import type {ApiResponse, SavePostRequest} from '../types'
import {SECTION_DICT} from "../constants/section.ts";
import {UploadFilled} from "@element-plus/icons-vue";
import {useSectionStore} from "../stores";

const router = useRouter()
const route = useRoute()
const sectionStore = useSectionStore()

const postFormRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const isEdit = ref(false)

const postForm = reactive<SavePostRequest>({
  id: route.params.id ? String(route.params.id) : undefined,
  title: '',
  content: '',
  sectionId: 0
})

const rules: FormRules = {
  title: [
    {required: true, message: '请输入帖子标题', trigger: 'blur'},
    {min: 1, max: 20, message: '标题长度在 1 到 20 个字符', trigger: 'blur'}
  ],
  sectionId: [
    {required: true, message: '请选择帖子分区', trigger: 'blur'}
  ]
}

// 处理图片上传（核心功能）
const beforeUploadImage = (rawFile: UploadRawFile) => {
  // 文件超限
  if (rawFile.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小超过 10 MB')
    return false
  }
  loading.value = true
  return true
};

const onUploadSuccess = (response: ApiResponse<string>) => {
  postForm.content += `[img]${response.data}[/img]`
  loading.value = false
}

const onUploadError = (error: Error) => {
  loading.value = false
  ElMessage.error(`上传图片出错：${error.message}`)
}

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
      postForm.sectionId = res.data.sectionId
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

    submitting.value = true
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
      submitting.value = false
    }
  })
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    loadPostDetail()
  } else if (sectionStore.id === 0 || !!sectionStore.id) {
    postForm.sectionId = sectionStore.id
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
}

.img-upload-area {
  margin-top: 20px;
}
</style>
