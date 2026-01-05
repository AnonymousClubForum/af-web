<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>用户注册</h2>
        </div>
      </template>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱（选填）" clearable/>
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
              v-model="registerForm.bio"
              type="textarea"
              placeholder="请输入个人简介（选填）"
              :rows="3"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
        <el-form-item>
          <div class="footer-links">
            <el-link type="primary" @click="goToLogin">已有账号？立即登录</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import {register} from '../api'
import type {SaveUserRequest} from '../types'

const router = useRouter()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive<SaveUserRequest & { confirmPassword: string }>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  bio: ''
})

const validatePassword = (_: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, validator: validatePassword, trigger: 'blur'}
  ],
  email: [
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const {confirmPassword, ...registerData} = registerForm
      const res = await register(registerData)
      if (res.data) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      }
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      loading.value = false
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;

  h2 {
    margin: 0;
    color: #333;
  }
}

.footer-links {
  width: 100%;
  text-align: center;
}
</style>
