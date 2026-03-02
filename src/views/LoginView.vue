<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>用户登录</h2>
        </div>
      </template>
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" clearable placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password
              type="password"
              @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" style="width: 100%" type="primary" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <div class="footer-links">
            <el-link type="primary" @click="goToRegister">还没有账号？立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import {login} from '../api'
import type {LoginRequest} from '../types'
import {useUserStore} from '../stores'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginRequest>({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 8, max: 20, message: '密码长度在 8 到 20 个字符', trigger: 'blur'},
    {
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&_#\\-+=:;,<.>])[A-Za-z\\d@$!%*?&_#\\-+=:;,<.>]{8,}$',
      message: '密码需包含大小写字母、数字和特殊字符',
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await login(loginForm)
      if (res.data) {
        userStore.setUser(res.data.user)
        userStore.setToken(res.data.token)
        ElMessage.success('登录成功')
        await router.push('/')
      }
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      loading.value = false
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 浅色模式渐变 */
:root .login-container {
  background: linear-gradient(120deg, #F5F7F9, #C9D9E9);
}

/* 深色模式渐变 */
.dark .login-container {
  background: linear-gradient(120deg, #1E1E1E, #232323);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;
}

.footer-links {
  width: 100%;
  text-align: center;
}
</style>
