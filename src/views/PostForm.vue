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
          <v-md-editor
              v-model="postForm.content"
              height="500px"
              placeholder="请输入帖子内容"
              left-toolbar="undo redo clear | h bold italic strikethrough quote | ul ol table hr ｜ image | save "
              right-toolbar="preview | fullscreen"
              :disabled-menus="[]"
              @upload-image="handleUploadImage"
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
import {uploadFile} from "../api/file.ts";

const router = useRouter()
const route = useRoute()

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
const handleUploadImage = async (event: any, insertImage: Function) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const res = await uploadFile(file);
    console.log(res.data)
    const imageUrl = '/storage/file/download?id=' + String(res.data)
    insertImage({ // 插入图片到Markdown编辑器中
      url: imageUrl,
      desc: file.name, // 图片描述
    });
    ElMessage.success('图片上传成功');
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败，请重试');
  }
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
          router.push(`/posts`)
        }
      } else {
        const res = await createPost(postForm)
        if (res.data) {
          ElMessage.success('发布成功')
          router.push(`/posts`)
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
