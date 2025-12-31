<template>
  <div class="auth-page">
    <div class="auth-form">
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
              type="text"
              id="username"
              v-model="username"
              placeholder="请输入用户名"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
              type="password"
              id="password"
              v-model="password"
              placeholder="请输入密码"
              required
          />
        </div>
        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="请再次输入密码"
              required
          />
        </div>
        <button type="submit">{{ isLogin ? '登录' : '注册' }}</button>
      </form>
      <p>
        {{ isLogin ? '没有账号？' : '已有账号？' }}
        <a href="#" @click.prevent="toggleMode">
          {{ isLogin ? '注册' : '登录' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import axios from "axios";
import router from "../../router";
import {useAvatarStore} from "../../store/avatarStore.ts";

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const avatarStore = useAvatarStore();

const toggleMode = () => {
  isLogin.value = !isLogin.value;
};

const submitForm = async () => {
  if (isLogin.value) {
    // 处理登录逻辑
    try {
      await axios.post(import.meta.env.VITE_API_URL + "/profile/login", {
        id: username.value,
        password: password.value
      });
      localStorage.setItem('profile', username.value);
      const res = await axios.post(import.meta.env.VITE_API_URL + "/profile/getAvatarUrl",
          {id: username.value});
      if (res.data !== null && res.data.length > 0) {
        avatarStore.setAvatarUrl(res.data);
      }
      router.back();
    } catch (error) {
      alert("用户名或密码错误！");
    }
  } else {
    // 处理注册逻辑
    if (password.value !== confirmPassword.value) {
      alert("确认密码与原密码不匹配！");
      return;
    }
    try {
      await axios.post(import.meta.env.VITE_API_URL + "/profile/register",
          {id: username.value, password: password.value});
      alert("注册成功！");
      isLogin.value = true;
    } catch (error) {
      alert(error);
    }
  }
};

</script>

<style scoped>
.auth-page {
  display: flex;
  width: 100vw;
  margin-top: 100px;
  justify-content: center;
  justify-self: center;
  align-items: center;
}

.auth-form {
  background: grey;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
}

h2 {
  margin-bottom: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

p {
  text-align: center;
  margin-top: 1rem;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
