<template>
  <div class="post-page">
    <div class="post-info">
      <h2>{{ post.title }}</h2>
      <div class="meta">
        <span @click="goToProfile"> <img class="avatar" alt="" :src="avatarUrl"> {{ post.author }} </span>
        <strong> 发布时间: </strong> {{ post.time }}
      </div>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import axios from "axios";
import router from "../../router";


interface Post {
  id: number;
  author: string;
  title: string;
  time: string;
  content: string;
}

const avatarUrl = ref<string>('/defaultAvatar.png');
const post = ref<Post>({
  id: -1,
  author: '',
  title: '',
  time: '',
  content: '',
});

const getPost = async () => {
  console.log(router.currentRoute.value.params.id);
  const res = await axios.post(import.meta.env.VITE_API_URL + "/post/getPost",
      {id: router.currentRoute.value.params.id});
  post.value = res.data;
  const userId = post.value.author;
  if (userId !== null && userId !== "") {
    const res = await axios.post(import.meta.env.VITE_API_URL + "/profile/getAvatarUrl", {id: userId});
    if (res.data !== null && res.data !== "") {
      console.log(res.data);
      avatarUrl.value = res.data;
    }
  }
};

const goToProfile = () => {
  const id = post.value.author;
  if (id !== null && id !== "") {
    router.push({name: 'profile', params: {id: id}});
  } else {
    alert("用户不存在！");
  }
};

onMounted(async () => {
  await getPost();
});

</script>

<style scoped>
.post-page {
  width: 80%;
  justify-self: center;
  margin-top: 60px;
  padding: 20px;
}

.post-info {
  align-items: center;
  margin-top: 20px;
}

.meta {
  display: inline;
  margin-left: 20px;
  text-align: left;

  span:hover {
    text-decoration: underline;
  }
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 100%;
}
</style>
