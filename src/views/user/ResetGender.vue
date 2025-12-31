<template>
  <div class="password-page">
    <div class="password-form">
      <h2> 修改性别 </h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <div class="form-item" v-for="g in genders">
            <input
                type="radio"
                :id=g
                :value=g
                v-model="gender"
                required
            />
            <label :for=g>{{ g }}</label>
          </div>
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

const genders = ["MALE", "FEMALE", "OTHER", "SECRET"];

const gender = ref('');

const submitForm = async () => {
  const id = localStorage.getItem("profile");
  try {
    await axios.post(import.meta.env.VITE_API_URL + "/profile/updateGender",
        {id: id, gender: gender.value});
    console.log('修改成功:', gender.value);
    router.back();
  } catch (error) {
    alert(error);
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

.form-item {
  display: flex;
}

</style>
