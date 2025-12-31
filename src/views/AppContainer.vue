<template>
  <div class="header">
    <div class="logo">
      <img alt="论坛Logo" src="/banner.png" width="306" height="45" @click="goToMain">
    </div>
    <div class="search-box">
      <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索帖子..."
          @keyup.enter="search"
          required
      />
      <button @click="search">搜索</button>
    </div>
    <img class="avatar" alt="" :src="avatarUrl" width="45" height="45" @click="goToProfile">
  </div>
  <RouterView/>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import router from "../router";
import axios from "axios";
import {useAvatarStore} from "../store/avatarStore.ts";

const searchQuery = ref('');
const avatarStore = useAvatarStore();
const avatarUrl = computed(() => avatarStore.avatarUrl);

// 监听 avatarUrl 的变化
watch(avatarUrl, (newUrl) => {
  console.log('头像URL已更新为:', newUrl);
});

const goToMain = () => {
  router.push("/");
}

const search = () => {
  if (searchQuery.value.trim()) {
    router.push({name: 'search', params: {query: searchQuery.value}});
  } else {
    alert('请输入搜索内容');
  }
};

const goToProfile = () => {
  const id = localStorage.getItem('profile');
  if (id !== null && id !== "") {
    router.push({name: 'profile', params: {id: id}});
  } else {
    router.push("/auth");
  }
};

onMounted(async () => {
  const userId = localStorage.getItem('profile');
  if (userId !== null && userId !== "") {
    const res = await axios.post(import.meta.env.VITE_API_URL + "/profile/getAvatarUrl", {id: userId});
    if (res.data !== null && res.data !== "") {
      console.log(res.data);
      avatarStore.setAvatarUrl(res.data);
    }
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  height: 50px;
  /* 将 100vw 改为 100% */
  width: 100%;
  /* 添加右侧内边距防止被滚动条覆盖 */
  padding-right: calc(100vw - 100%);
  background-color: dimgrey;
  position: fixed;
}

.logo {
  display: flex;
  width: 500px;
  line-height: 45px;
  text-align: center;

  img:hover {
    cursor: pointer;
  }
}

.search-box {
  display: flex;
  align-items: center;

  input {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 8px;
    flex: 1;
  }
}

.avatar {
  border-radius: 100%;
}

/* 添加媒体查询以调整小屏幕下的样式 */
@media (max-width: 700px) {
  .header {
    align-items: flex-start; /* 使子元素靠左对齐 */
  }

  .logo {
    display: none;
  }

  .search-box {
    align-items: flex-start;
  }

}
</style>
