<template>
  <div class="profile-page">
    <h2>个人资料</h2>
    <div class="profile-info">
      <div class="avatar">
        <img alt="" :src="user.avatarUrl">
        <button v-if="isMe" @click="showModal = true">上传头像</button>
      </div>
      <div class="details">
        <p><strong>用户名:</strong> {{ user.id }}</p>
        <p><strong>性别:</strong> {{ user.gender }}</p>
        <p v-if="user.isAdmin"><strong>管理员</strong></p>
      </div>
    </div>
    <div v-if="isMe" class="edit-profile">
      <button @click="editPassword">修改密码</button>
      <button @click="editGender">编辑性别</button>
      <button @click="goToNewPost">发布帖子</button>
      <button @click="logout">退出登录</button>
    </div>
    <div class="posts-container">
      <p>发布的帖子：</p>
      <div v-for="post in userPosts" :key="post.id" class="post-item" @click="goToPost(post.id)">
        <h2 v-if="post.title!==''">{{ post.title }}</h2>
        <p>{{ post.content }}</p>
        <div class="post-meta">
          <span>投稿者: {{ post.author }}</span>
          <span>发布时间: {{ post.time }}</span>
        </div>
      </div>
    </div>
    <!-- 模态框开始 -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <img class="bigImg" :src=valueUrl v-if="valueUrl" alt="">
        <input type="file" @change="handleFileChange" accept="image/*"/>
        <button @click="uploadAvatar">上传</button>
        <button @click="showModal = false">取消</button>
      </div>
    </div>
    <!-- 模态框结束 -->
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import axios from "axios";
import router from "../../router";
import {useAvatarStore} from "../../store/avatarStore.ts";

interface User {
  id: string;
  isAdmin: boolean;
  gender: string;
  avatarUrl: string;
}

interface Post {
  id: number;
  author: string;
  title: string;
  time: string;
  content: string;
}

const user = ref<User>({
  id: '',
  isAdmin: false,
  gender: '',
  avatarUrl: '/defaultAvatar.png'
});
const userPosts = ref<Post[]>([]);
const isMe = ref<boolean>(false);
const showModal = ref<boolean>(false);
const selectedFile = ref<File | null>(null);
const valueUrl = ref<string | null>(null);
const avatarStore = useAvatarStore();

const getUser = async () => {
  const userId = router.currentRoute.value.params.id;
  if (userId === localStorage.getItem('profile')) {
    isMe.value = true;
  }
  try {
    const res = await axios.post(import.meta.env.VITE_API_URL + "/profile/getUser", {id: userId});
    user.value = res.data;
    if (user.value.avatarUrl === null || user.value.avatarUrl === '') {
      user.value.avatarUrl = '/defaultAvatar.png';
    }
  } catch (error) {
    alert("用户信息未找到！");
  }
}

const getUserPosts = async () => {
  const res = await axios.post(import.meta.env.VITE_API_URL + "/post/userPosts", {author: user.value.id});
  userPosts.value = res.data;
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (!file)
      return;
    selectedFile.value = file;

    // 判断上传文件的大小（以MB为单位）
    const fileSizeInMB = file.size / 1024 / 1024;
    if (fileSizeInMB >= 2) {
      alert('上传头像图片大小不能超过 2MB!');
      return;
    }
    // 判断文件类型是否为图片
    if (!file.type.startsWith('image')) {
      alert('选择的文件不是图片！');
      return;
    }

    // 创建读取文件对象
    const reader = new FileReader();
    reader.readAsDataURL(file); // 发起异步请求，读取文件

    // 文件读取完成后
    reader.onload = (e) => {
      if (e.target) {
        valueUrl.value = e.target.result as string;
        console.log(e.target.result);
      }
    };

    reader.onerror = (error) => {
      console.error("文件读取错误: ", error);
      alert("文件读取失败，请重试！");
    };
  }
}

const uploadAvatar = async () => {
  if (selectedFile.value) {
    try {
      let formData = new FormData();
      formData.append('file', selectedFile.value);
      formData.append('id', user.value.id);
      const res = await axios.post(import.meta.env.VITE_API_URL + "/img/uploadAvatar",
          formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
      avatarStore.setAvatarUrl(res.data);
      user.value.avatarUrl = res.data;
      showModal.value = false;
    } catch (error) {
      console.log(error);
      alert("上传失败，请重试！");
    }
  } else {
    alert("请选择文件！");
  }
}

const editPassword = () => {
  router.push({name: 'password'});
}

const editGender = () => {
  router.push({name: "gender"});
};

const goToPost = async (id: number) => {
  await router.push({name: 'post', params: {id: id}});
}

const goToNewPost = async () => {
  await router.push({name: "newPost"});
}

const logout = () => {
  localStorage.removeItem('profile');
  avatarStore.removeAvatarUrl();
  user.value.avatarUrl = '/defaultAvatar.png';
  router.push("/");
}

// 监听路由参数变化
watch(
    () => router.currentRoute.value.params.id,
    async (newId) => {
      if (newId) {
        await getUser();
        await getUserPosts();
      }
    }
);

onMounted(async () => {
  await getUser();
  await getUserPosts();
});
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin-left: 50px;
  margin-top: 60px;
  padding: 20px;
}

.profile-info {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.avatar img {
  width: 150px;
  height: 150px;
  border-radius: 100%;
}

.details {
  margin-left: 20px;
  text-align: left;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 5px;
}

.posts-container {
  max-width: 800px;
  margin-top: 70px;
  padding: 20px;
}

.post-item {
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

/* 模态框样式开始 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.modal input::file-selector-button {
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  background-color: #42b983;
  color: white;
  border: none;
}

.modal button {
  margin-top: 0;
  margin-right: 10px;
}

.bigImg {
  display: block;
  width: 500px;
  height: 500px;
  border-radius: 100%;
}

/* 模态框样式结束 */
</style>
