<template>
  <div class="edit-post-page">
    <h2>编辑发布帖子</h2>
    <form @submit.prevent="submitPost">
      <div class="form-group">
        <input type="text" id="title" v-model="post.title" placeholder="标题（选填）"/>
      </div>
      <div class="form-group">
        <textarea id="content" v-model="post.content" placeholder="内容" required></textarea>
      </div>
      <button type="submit">发布</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import axios from "axios";
import router from "../../router";

const post = ref({
  title: '',
  content: '',
});

const submitPost = async () => {
  // 在这里处理发布逻辑，例如调用API
  const author = localStorage.getItem("profile");
  if (author === null) {
    alert("请登录后再发布帖子！")
    return;
  }
  const res = await axios.post(import.meta.env.VITE_API_URL + "/post/addPost", {
    author: author,
    title: post.value.title,
    content: post.value.content
  });
  alert(res.data);
  await router.push("/");
};
</script>

<style scoped>
.edit-post-page {
  margin-top: 20px;
  width: 100vw;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"] {
  width: 50%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  width: 80%;
  height: 200px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  position: fixed;
  right: 50px;
  bottom: 50px;
  padding: 10px 20px;
  font-size: 16px;
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
