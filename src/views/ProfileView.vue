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
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
          >
            <el-avatar v-if="userForm.avatarUrl" :src="userForm.avatarUrl" :size="120"/>
            <el-icon v-else class="avatar-uploader-icon" :size="60">
              <Plus/>
            </el-icon>
            <div class="upload-tip">点击上传头像</div>
          </el-upload>
        </div>

        <el-form :model="userForm" ref="userFormRef" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled/>
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="userForm.gender">
              <el-radio label="男"/>
              <el-radio label="女"/>
              <el-radio label="其他"/>
              <el-radio label="秘密"/>
            </el-radio-group>
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
            <el-button @click="loadUserInfo">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type UploadProps} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {updateUser, uploadAvatar} from '../api'
import type {SaveUserRequest} from '../types'
import {useUserStore} from '../stores'
import {blobToFile, compressImage} from "../utils/image";

const router = useRouter()
const userStore = useUserStore()

const userFormRef = ref<FormInstance>()
const loading = ref(false)

const userForm = reactive<SaveUserRequest & { avatarUrl: string | undefined }>({
  username: "",
  password: "",
  gender: "",
  avatarUrl: undefined
})

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  await userStore.loadFromServer()
  userForm.username = userStore.user?.username
  userForm.gender = userStore.user?.gender
  userForm.avatarUrl = userStore.user?.avatarUrl
  loading.value = false
}

// 上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = async (rawFile) => {
  if (!(['image/jpeg', 'image/png'].includes(rawFile.type))) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 >= 3) {
    ElMessage.error('头像大小不能超过3M!')
    return false
  }
  try {
    // 压缩图片
    const compressedBlob = await compressImage(rawFile, {
      initialQuality: 0.7,
      outputType: rawFile.type as 'image/jpeg' | 'image/png'
    });
    const compressedFile = blobToFile(compressedBlob, rawFile);

    console.log('原文件大小：', (rawFile.size / 1024).toFixed(2), 'KB');
    console.log('压缩后大小：', (compressedFile.size / 1024).toFixed(2), 'KB');

    if (compressedFile.size / 1024 >= 128) {
      ElMessage.error('上传的头像过大!')
      return false
    }

    // 手动上传
    const res = await uploadAvatar(compressedFile)
    if (res.code === 200 || res.code === 0) {
      const user = userStore.user
      if (!user) {
        ElMessage.error('未授权，请重新登录')
        router.push('/login')
        return false
      }
      user.avatarId = res.data
      userStore.setUser(user)
      await loadUserInfo()
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.msg || '头像上传失败')
    }
    // 阻止默认上传（因为已经手动上传了压缩后的文件）
    return false;
  } catch (error) {
    console.error('压缩失败：', error);
  }
  return false
}

// 更新用户信息
const handleUpdate = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const updateData: SaveUserRequest = {
        username: userForm.username,
        password: userForm.password,
        gender: userForm.gender
      }

      const res = await updateUser(updateData)
      if (res.data) {
        await loadUserInfo()
        ElMessage.success('修改成功')
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 退出登录
const handleLogout = () => {
  userStore.clear()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 页面加载时获取用户信息
onMounted(() => {
  loadUserInfo()
})
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
