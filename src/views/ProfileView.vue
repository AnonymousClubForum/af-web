<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>个人中心</h2>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </template>

      <div class="profile-content">
        <div class="avatar-section">
          <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :on-error="handleUploadError"
          >
            <el-avatar v-if="userForm.avatar" :src="userForm.avatar" :size="120"/>
            <el-icon v-else class="avatar-uploader-icon" :size="60">
              <Plus/>
            </el-icon>
            <div class="upload-tip">点击上传头像</div>
          </el-upload>
        </div>

        <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled/>
          </el-form-item>

          <el-form-item label="性别" prop="email">
            <el-input v-model="userForm.gender" placeholder="请输入性别" clearable/>
          </el-form-item>

<!--          <el-form-item label="个人简介" prop="bio">-->
<!--            <el-input-->
<!--                v-model="userForm.bio"-->
<!--                type="textarea"-->
<!--                placeholder="请输入个人简介"-->
<!--                :rows="4"-->
<!--                maxlength="200"-->
<!--                show-word-limit-->
<!--            />-->
<!--          </el-form-item>-->

          <el-form-item>
            <el-button type="primary" @click="handleUpdate" :loading="loading">
              保存修改
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type FormRules, type UploadProps} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {getCurrentUser, updateUser} from '../api'
import type {SaveUserRequest} from '../types'
import {useUserStore} from '../stores'

const router = useRouter()
const userStore = useUserStore()

const userFormRef = ref<FormInstance>()
const loading = ref(false)

const uploadUrl = computed(() => import.meta.env.VITE_API_BASE_URL + '/user/upload/avatar')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

const userForm = reactive<SaveUserRequest>({
  username: "",
  password: "",
  gender: ""
})

const rules: FormRules = {
  email: [
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ]
}

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    const res = await getCurrentUser()
    if (res.data) {
      userForm.username = res.data.username
      userForm.gender = res.data.gender || ''
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type)
  const isLt10M = rawFile.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('头像只能是 JPG/PNG/GIF 格式!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('头像大小不能超过 10MB!')
    return false
  }
  return true
}

// 上传成功
const handleAvatarSuccess = (response: any) => {
  if (response.code === 200 || response.code === 0) {
    userForm.avatar = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('头像上传失败')
}

// 更新用户信息
const handleUpdate = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (userStore.user) {
        const updateData: SaveUserRequest = {
          username: userStore.user.username,
          password: "",
          avatar: userForm.avatar,
          gender: userForm.gender
        }

        const res = await updateUser(updateData)
        if (res.data) {
          userStore.updateUser(updateData)
          ElMessage.success('修改成功')
        }
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  loadUserInfo()
}

// 退出登录
const handleLogout = () => {
  userStore.clearUser()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 页面加载时获取用户信息
loadUserInfo()
</script>

<style scoped>
.profile-container {
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

.profile-content {
  display: flex;
  gap: 40px;

  .avatar-section {
    flex-shrink: 0;

    :deep(.avatar-uploader) {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;

      .avatar-uploader-icon {
        border: 2px dashed #d9d9d9;
        border-radius: 50%;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
        }
      }

      .avatar-uploader-icon {
        color: #8c939d;
      }

      .upload-tip {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
  }
}
</style>
