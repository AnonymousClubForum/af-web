<template>
  <div class="password-page">
    <div class="password-form">
      <h2> 修改密码 </h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="password">旧密码</label>
          <input
              type="password"
              id="oldPassword"
              v-model="oldPassword"
              placeholder="请输入旧密码"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">新密码</label>
          <input
              type="password"
              id="password"
              v-model="password"
              placeholder="请输入新密码"
              required
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="请再次输入新密码"
              required
          />
        </div>
        <button type="submit">提交</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import axios from "axios";
import router from "../../router";

const oldPassword = ref('');
const password = ref('');
const confirmPassword = ref('');

const submitForm = async () => {
  if (password.value !== confirmPassword.value) {
    alert("确认密码与原密码不匹配！");
    return;
  }
  try {
    await axios.post(import.meta.env.VITE_API_URL + "/profile/updatePassword",
        {id: localStorage.getItem("profile"), oldPassword: oldPassword.value, newPassword: password.value});
    console.log('修改成功:', localStorage.getItem("profile"), password.value);
    alert("修改成功！");
    router.back();
  } catch (error) {
    alert("用户名或密码错误！");
  }
};

</script>

<style scoped>
.password-page {
  display: flex;
  width: 100vw;
  margin-top: 100px;
  justify-content: center;
  justify-self: center;
  align-items: center;
}

.password-form {
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
</style>
