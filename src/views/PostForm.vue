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
          <MdEditor
              v-model="postForm.content"
              :theme="isDark ? 'dark' : 'light'"
              :toolbars="['bold','underline','italic','strikeThrough','-','link','image','=','preview','previewOnly']"
              height="500px"
              placeholder="请输入帖子内容"
              @onUploadImg="handleUploadImage"
          />
        </el-form-item>

        <div style="justify-self: right">
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
import {SECTION_DICT} from "../constants/section.ts";

const router = useRouter()
const route = useRoute()
const isDark = useDark()

const postFormRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

const postForm = reactive<SavePostRequest>({
  id: route.params.id ? String(route.params.id) : undefined,
  title: '',
  content: '',
  sectionId: undefined
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
const handleUploadImage = async (files: Array<File>, callback: (urls: string[] | {
  url: string;
  alt: string;
  title: string
}[]) => void) => {
  const MAX_SIZE = 10 * 1024 * 1024
  const [overSizeFiles, validFiles] = files.reduce(
      (acc, file) => {
        // 解构累加器
        const [over, valid] = acc;
        if (file.size >= MAX_SIZE) {
          over.push(file);
        } else {
          valid.push(file);
        }
        return acc;
      },
      [[], []] as [File[], File[]]
  )

  // 提示部分文件超限
  if (overSizeFiles.length > 0) {
    ElMessage.error(`有 ${overSizeFiles.length} 个文件大小超过 ${MAX_SIZE / 1024 / 1024} MB，已跳过上传`)
  }

  // 无合规文件时直接调用回调，避免无意义的请求
  if (validFiles.length === 0) {
    callback([])
    return
  }

  const res = await Promise.all(validFiles.map(file => uploadFile(file)))
  callback(res.map((item: any) => `/storage/file/download?id=${item.data}`))
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
