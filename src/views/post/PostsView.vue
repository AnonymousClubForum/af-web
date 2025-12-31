<template>
  <div class="columns">
    <div v-for="column in columns" class="column" @click="selectColumn(column)"
         :class="{ active: selectedColumn === column }" :key="column">
      {{ column }}
    </div>
  </div>

  <div class="posts-container">
    <div v-for="post in sortedPosts" :key="post.id" class="post-item" @click="goToPost(post.id)">
      <h2 v-if="post.title !== ''">{{ post.title }}</h2>
      <p>{{ post.content }}</p>
      <div class="post-meta">
        <span> 投稿者: {{ post.author }} </span>
        <span> 发布时间: {{ post.time }} </span>
      </div>
    </div>
  </div>

  <button class="floating-button" @click="goToNewPost">发布新帖子</button>
</template>

<script setup lang="ts">
import axios from "axios";
import {computed, onMounted, ref} from "vue";
import router from "../../router";

interface Post {
  id: number;
  author: string;
  title: string;
  time: string;
  content: string;
}

const columns = ref<string[]>(["最新", "全部"]);
const posts = ref<Post[]>([]);
const selectedColumn = ref<string>("最新");

const goToPost = async (id: number) => {
  await router.push({name: 'post', params: {id: id}});
}

const goToNewPost = async () => {
  await router.push({name: "newPost"});
}

const getPosts = async () => {
  const postsRes = await axios.post(import.meta.env.VITE_API_URL + "/post/getAllPosts");
  posts.value = postsRes.data;
  for (let i = 0; i < posts.value.length; i++) {
    let post = posts.value[i];
    if (post && post.content && post.content.length > 25) {
      post.content = post.content.substring(0, 25) + "...";
    }
  }
}

const selectColumn = (column: string) => {
  selectedColumn.value = column;
}

const sortedPosts = computed(() => {
  if (selectedColumn.value === "最新") {
    return posts.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }
  if (selectedColumn.value === "全部") {
    return posts.value.sort((a, b) => a.id - b.id);
  }
  // 如果有其他排序需求，可以在这里添加
  return posts.value;
})

onMounted(async () => {
  await getPosts();
});
</script>

<style scoped>
.columns {
  display: flex;
  top: 50px;
  position: fixed;
  width: 100%;
  background-color: #888888;
}

.column {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.column.active {
  border: solid 1px #535bf2;
}

.posts-container {
  justify-items: center;
  width: 100vw;
  margin-top: 70px;
  padding: 20px;
}

.post-item {
  width: 80%;
  border-bottom: 1px solid #eee;
  padding: 20px 0;

  h2 {
    margin: 0 0 10px;
  }
}

.post-item:hover {
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
}

.post-meta {
  font-size: 0.9em;
  color: #666;

  span {
    margin-right: 10px;
  }
}

/* 悬浮按钮样式 */
.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>