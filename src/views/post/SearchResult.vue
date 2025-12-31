<template>
  <div class="posts-container">
    <div class="columns">
      <div v-for="column in columns" class="column" @click="selectColumn(column)"
           :class="{ active: selectedColumn === column }" :key="column">
        {{ column }}
      </div>
    </div>
    <div v-for="post in posts" :key="post.id" class="post-item" @click="goToPost(post.id)">
      <h2 v-if="post.title">{{ post.title }}</h2>
      <p>{{ post.content }}</p>
      <div class="post-meta">
        <span> 投稿者: {{ post.author }} </span>
        <span> 发布时间: {{ post.time }} </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {onMounted, ref, watch} from "vue";
import router from "../../router";

interface Post {
  id: number;
  author: string;
  title: string;
  time: string;
  content: string;
}

const columns = ref<string[]>(["按标题", "按内容", "按投稿者"]);
const posts = ref<Post[]>([]);
const selectedColumn = ref<string>("按标题");

const selectColumn = async (column: string) => {
  selectedColumn.value = column;
  await fetchPosts();
}

const goToPost = async (id: number) => {
  await router.push({name: 'post', params: {id: id}});
}

const fetchPosts = async () => {
  const query = router.currentRoute.value.params.query;
  if (!query) return;
  try {
    const type = columnMap[selectedColumn.value];
    const postsRes = await axios.post(import.meta.env.VITE_API_URL + "/post/searchPosts",
        {query: query, type: type});
    posts.value = postsRes.data;
  } catch (error) {
    console.error("获取帖子时出错:", error);
  }
}

const columnMap: { [key: string]: string } = {
  "按标题": "title",
  "按内容": "content",
  "按投稿者": "author",
};

watch(
    () => router.currentRoute.value.params.query,
    async (newQuery) => {
      if (newQuery) {
        selectedColumn.value = "按标题";
        await fetchPosts();
      }
    }
);

onMounted(async () => {
  await fetchPosts();
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
  margin-top: 80px;
}

.post-item {
  width: 80%;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.post-item h2 {
  margin: 0 0 10px;
}

.post-item:hover {
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
}

.post-meta {
  font-size: 0.9em;
  color: #666;
}

.post-meta span {
  margin-right: 10px;
}
</style>
